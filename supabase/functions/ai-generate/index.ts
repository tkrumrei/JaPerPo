// Supabase Edge Function: ai-generate
// Aufruf vom Frontend mit { userId, action, payload }
// - haelt Gemini-API-Key geheim
// - Rate Limit ueber ai_usage Tabelle (100 calls / user / Stunde)
// - response_mime_type=application/json fuer strukturierte Outputs

import { createClient } from 'npm:@supabase/supabase-js@2.106.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'meta-llama/llama-3.1-8b-instruct:free';
const RATE_LIMIT_PER_HOUR = Number(Deno.env.get('RATE_LIMIT_PER_HOUR') ?? '100');

const VALID_USERS = ['luca', 'darian', 'tobi'] as const;
type UserId = (typeof VALID_USERS)[number];

const VALID_LANGS = ['ja', 'fa', 'pt'] as const;
type LanguageCode = (typeof VALID_LANGS)[number];

const VALID_ACTIONS = [
  'vocab',
  'dialogue',
  'reading',
  'cloze',
  'chat',
  'grammar',
  'test',
  'sentence_of_day',
] as const;
type Action = (typeof VALID_ACTIONS)[number];

interface RequestBody {
  userId: UserId;
  action: Action;
  payload: Record<string, unknown>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(
      { ok: false, error: 'Edge Function nicht konfiguriert (Supabase Secrets fehlen).' },
      500,
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ ok: false, error: 'Body ist kein gueltiges JSON.' }, 400);
  }

  if (!VALID_USERS.includes(body.userId)) {
    return json({ ok: false, error: 'Unbekannter userId.' }, 400);
  }
  if (!VALID_ACTIONS.includes(body.action)) {
    return json({ ok: false, error: 'Unbekannte action.' }, 400);
  }

  // ==========================================================
  // Dynamische API-Key Auswahl basierend auf dem Nutzer
  // ==========================================================
  const apiKeyMapping: Record<UserId, string> = {
    luca: 'L_OPENROUTER_API_KEY',
    darian: 'D_OPENROUTER_API_KEY',
    tobi: 'T_OPENROUTER_API_KEY',
  };

  const envKeyName = apiKeyMapping[body.userId];
  const USER_API_KEY = Deno.env.get(envKeyName);

  if (!USER_API_KEY) {
    return json(
      { ok: false, error: `API-Key für Nutzer '${body.userId}' (${envKeyName}) fehlt in Supabase.` },
      500
    );
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Rate Limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: rateErr } = await admin
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', body.userId)
    .gte('created_at', oneHourAgo);
  if (rateErr) {
    return json({ ok: false, error: `Rate-Lookup fehlgeschlagen: ${rateErr.message}` }, 500);
  }
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json(
      {
        ok: false,
        error: `Rate Limit erreicht (${RATE_LIMIT_PER_HOUR} / Stunde). Bitte warte etwas.`,
      },
      429,
    );
  }

  // Prompt + Schema je Aktion zusammenbauen
  let prompt: string;
  let schema: Record<string, unknown> | undefined;
  try {
    // HIER ÄNDERN: body.userId als erstes Argument übergeben!
    ({ prompt, schema } = buildPrompt(body.userId, body.action, body.payload));
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 400);
  }

  // ==========================================================
  // OpenRouter-Aufruf
  // ==========================================================
  const url = `https://openrouter.ai/api/v1/chat/completions`;

  let finalPrompt = prompt;

  if (schema) {
    finalPrompt += `\n\nWICHTIG: Antworte AUSSCHLIESSLICH als reines JSON. ` +
      `Kopiere NIEMALS die Wörter "type", "properties" oder "required" in deine Antwort! ` +
      `Dein JSON-Objekt muss direkt mit den geforderten Schlüsseln beginnen. ` +
      `Hier ist das Schema, an das du dich inhaltlich halten musst:\n${JSON.stringify(schema, null, 2)}`;
  }

  const requestBody: Record<string, unknown> = {
    model: GEMINI_MODEL,
    messages: [{ role: 'user', content: finalPrompt }],
    temperature: body.action === 'chat' ? 0.9 : 0.7,
  };

  if (schema) {
    requestBody.response_format = { type: 'json_object' };
  }

  const aiRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Wir nutzen jetzt den dynamisch geladenen Key des Users!
      'Authorization': `Bearer ${USER_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!aiRes.ok) {
    const errorText = await aiRes.text();
    return json(
      { ok: false, error: `KI-Fehler ${aiRes.status}: ${errorText.slice(0, 500)}` },
      502,
    );
  }

  const aiJson = (await aiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const rawText = aiJson.choices?.[0]?.message?.content ?? '';

  let data: unknown = rawText;
  if (schema) {
    try {
      const cleanedText = rawText.replace(/^```(json)?|```$/gm, '').trim();
      data = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('JSON Parse Fehler. Rohtext war:', rawText);
      return json({ ok: false, error: 'KI-Antwort war kein gueltiges JSON.' }, 502);
    }
  }

  if (body.action === 'vocab' && data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      data = obj.items;
    } else {
      const firstArray = Object.values(obj).find((v) => Array.isArray(v));
      if (firstArray) data = firstArray;
    }
  }

  // ==========================================================
  // Usage protokollieren
  // ==========================================================

  await admin.from('ai_usage').insert({
    user_id: body.userId,
    endpoint: body.action,
    tokens_in: aiJson.usage?.prompt_tokens ?? null,
    tokens_out: aiJson.usage?.completion_tokens ?? null,
  });

  return json({ ok: true, data });
});

// ============================================================
// Prompts
// ============================================================

function buildPrompt(
  userId: UserId,
  action: Action,
  payload: Record<string, unknown>,
): { prompt: string; schema?: Record<string, unknown> } {
  const language = String(payload.language ?? '');
  if (!VALID_LANGS.includes(language as LanguageCode)) {
    throw new Error(`payload.language muss ja|fa|pt sein (war: ${language}).`);
  }
  const langName: Record<LanguageCode, string> = {
    ja: 'Japanisch',
    fa: 'Persisch',
    pt: 'europaeisches Portugiesisch (Portugal)',
  };
  const langLabel = langName[language as LanguageCode];

  switch (action) {
    case 'vocab': {
      const level = String(payload.level ?? 'A1');
      const topic = String(payload.topic ?? 'Alltag');
      const count = Math.min(20, Math.max(1, Number(payload.count ?? 10)));

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Generiere ${count} anspruchsvolle, fortgeschrittene Vokabeln in ${langLabel} fuer Niveau ${level}, Thema "${topic}". `;
      } else if (userId === 'darian') {
        userPrompt = `Erstelle eine Liste von ${count} alltagsnahen, haeufig genutzten Vokabeln in ${langLabel} (Niveau ${level}) zum Thema "${topic}". `;
      } else {
        userPrompt = `Gib mir ${count} typische Vokabeln in ${langLabel} fuer Niveau ${level}, Thema "${topic}". `;
      }

      return {
        prompt:
          userPrompt +
          `Fuer ${langLabel} gib Wort in Originalschrift, deutsche Uebersetzung, lateinische Lautschrift und einen Beispielsatz. ` +
          `Antworte als JSON-Objekt mit dem Feld "items" (Array der Vokabeln).`,
        schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  word: { type: 'string' },
                  translation: { type: 'string' },
                  transcription: { type: 'string' },
                  exampleSentence: { type: 'string' },
                  category: { type: 'string' },
                },
                required: ['word', 'translation', 'exampleSentence'],
              },
            },
          },
          required: ['items'],
        },
      };
    }

    case 'dialogue': {
      const scenario = String(payload.scenario ?? 'Restaurant');
      const level = String(payload.level ?? 'A1');

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Erstelle einen anspruchsvollen, eher formellen Dialog in ${langLabel} fuer Niveau ${level}, Szenario "${scenario}". Verwende hoefliche Formen und komplexeres Vokabular. `;
      } else if (userId === 'darian') {
        userPrompt = `Erstelle einen sehr lockeren, umgangssprachlichen Dialog in ${langLabel} fuer Niveau ${level}, Szenario "${scenario}". Verwende natuerliche Alltagssprache. `;
      } else {
        userPrompt = `Erstelle einen typischen Lerndialog in ${langLabel} fuer Niveau ${level}, Szenario "${scenario}". `;
      }

      return {
        prompt:
          userPrompt +
          `8 Schritte abwechselnd ai/user. Felder pro Schritt: speaker, text, transcription, translation, hints (Array). ` +
          `Antworte als JSON-Objekt.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            scenario: { type: 'string' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  speaker: { type: 'string', enum: ['ai', 'user'] },
                  text: { type: 'string' },
                  transcription: { type: 'string' },
                  translation: { type: 'string' },
                  hints: { type: 'array', items: { type: 'string' } },
                },
                required: ['speaker', 'text'],
              },
            },
          },
          required: ['title', 'steps'],
        },
      };
    }

    case 'reading': {
      const level = String(payload.level ?? 'A1');
      const topic = String(payload.topic ?? 'Alltag');
      const minWords = Math.min(400, Math.max(50, Number(payload.minWords ?? 120)));

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Schreibe einen sprachlich anspruchsvollen Lesetext in ${langLabel} fuer Niveau ${level} zum Thema "${topic}". Nutze abwechslungsreiche Satzstrukturen. `;
      } else if (userId === 'darian') {
        userPrompt = `Schreibe einen leicht verstaendlichen, unterhaltsamen Lesetext in ${langLabel} fuer Niveau ${level} zum Thema "${topic}". Halte die Saetze relativ kurz. `;
      } else {
        userPrompt = `Schreibe einen klassischen Lesetext in ${langLabel} fuer Niveau ${level} zum Thema "${topic}". `;
      }

      return {
        prompt: userPrompt + `Mindestens ${minWords} Woerter. Antworte als JSON-Objekt.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            wordCount: { type: 'integer' },
          },
          required: ['title', 'content', 'wordCount'],
        },
      };
    }

    case 'cloze': {
      const level = String(payload.level ?? 'A1');
      const source = payload.source ? String(payload.source) : null;

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Erzeuge einen schweren Lueckentext in ${langLabel} fuer Niveau ${level}. Der Fokus soll auf feinen Grammatikunterschieden und anspruchsvollen Vokabeln liegen. `;
      } else if (userId === 'darian') {
        userPrompt = `Erzeuge einen einfachen, machbaren Lueckentext in ${langLabel} fuer Niveau ${level}. Konzentriere dich auf wichtige Alltagswoerter. `;
      } else {
        userPrompt = `Erzeuge einen ausgewogenen Lueckentext in ${langLabel} fuer Niveau ${level}. `;
      }

      return {
        prompt:
          userPrompt +
          (source ? `Quelle: ${source}\n` : '') +
          `Felder: title, contentText (Text mit {{0}}, {{1}}... als Lueckenmarker), positions (Array mit index/answer/hint). ` +
          `Antworte als JSON-Objekt.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            contentText: { type: 'string' },
            positions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: { type: 'integer' },
                  answer: { type: 'string' },
                  hint: { type: 'string' },
                },
                required: ['index', 'answer'],
              },
            },
          },
          required: ['title', 'contentText', 'positions'],
        },
      };
    }

    case 'chat': {
      const message = String(payload.message ?? '');
      const history = Array.isArray(payload.history) ? payload.history : [];
      const historyText = (history as Array<{ role: string; content: string }>)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Du bist ein anspruchsvoller Sprachlehrer fuer ${langLabel}. Korrigiere kleine Fehler sofort und nutze gehobenes Vokabular. `;
      } else if (userId === 'darian') {
        userPrompt = `Du bist ein sehr lockerer, freundlicher Sprachpartner fuer ${langLabel}. Nutze oft umgangssprachliche Ausdruecke und sei sehr motivierend. `;
      } else {
        userPrompt = `Du bist ein geduldiger und freundlicher Tutor fuer ${langLabel}. Schreibe auch immer, das romanisierte Japansich unter den japanisches Satz. `;
      }

      return {
        prompt:
          userPrompt +
          `Antworte in ${langLabel} (max 2-3 Saetze) und fuege darunter eine kurze deutsche Erklaerung an. ` +
          `Bisheriger Verlauf:\n${historyText}\n\nNutzer: ${message}`,
      };
    }

    case 'grammar': {
      const topic = String(payload.topic ?? 'Grammatik');
      const level = String(payload.level ?? 'A1');

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Erklaere das Grammatikthema "${topic}" in ${langLabel} (Niveau ${level}) detailliert und linguistisch präzise auf Deutsch. `;
      } else if (userId === 'darian') {
        userPrompt = `Erklaere das Grammatikthema "${topic}" in ${langLabel} (Niveau ${level}) extrem simpel, anschaulich und ohne zu viele Fachbegriffe auf Deutsch. `;
      } else {
        userPrompt = `Erklaere das Grammatikthema "${topic}" in ${langLabel} (Niveau ${level}) kurz und verstaendlich auf Deutsch. `;
      }

      return {
        prompt:
          userPrompt +
          `Gib exakt 3 Beispielsaetze (Originalschrift + Lautschrift + Uebersetzung). ` +
          `WICHTIG: Verwende innerhalb deiner Texte (z.B. in der Erklaerung) AUSSCHLIESSLICH einfache Anfuehrungszeichen (') und niemals doppelte ("), da sonst die JSON-Struktur zerstoert wird!`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            explanation: { type: 'string' },
            examples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  transcription: { type: 'string' },
                  translation: { type: 'string' },
                },
                required: ['text', 'translation'],
              },
            },
          },
          required: ['title', 'explanation', 'examples'],
        },
      };
    }

    case 'test': {
      const level = String(payload.level ?? 'A1');
      const type = String(payload.type ?? 'mixed');
      const count = Math.min(20, Math.max(3, Number(payload.count ?? 8)));

      let userPrompt = '';
      if (userId === 'luca') {
        userPrompt = `Erzeuge einen anspruchsvollen Test (${type}) in ${langLabel} fuer Niveau ${level} mit ${count} kniffligen Fragen und aehnlichen Distraktoren. `;
      } else if (userId === 'darian') {
        userPrompt = `Erzeuge einen leichten, motivierenden Test (${type}) in ${langLabel} fuer Niveau ${level} mit ${count} klaren Fragen ohne fiese Fallen. `;
      } else {
        userPrompt = `Erzeuge einen Standard-Test (${type}) in ${langLabel} fuer Niveau ${level} mit ${count} Fragen. `;
      }

      return {
        prompt: userPrompt + `Antworte als JSON-Objekt.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  prompt: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  answer: { type: 'string' },
                  hint: { type: 'string' },
                },
                required: ['type', 'prompt', 'answer'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      };
    }

    case 'sentence_of_day': {
      return {
        prompt:
          `Erfinde einen kurzen, eleganten Satz, der in allen drei Sprachen funktioniert ` +
          `(Japanisch, Persisch, europaeisches Portugiesisch). Liefere fuer jede Sprache den Satz ` +
          `und eine deutsche Erklaerung dazu. Antworte als JSON-Objekt.`,
        schema: {
          type: 'object',
          properties: {
            texts: {
              type: 'object',
              properties: {
                ja: { type: 'string' },
                fa: { type: 'string' },
                pt: { type: 'string' },
              },
              required: ['ja', 'fa', 'pt'],
            },
            explanation: { type: 'string' },
            highlightedWords: { type: 'array', items: { type: 'string' } },
          },
          required: ['texts', 'explanation'],
        },
      };
    }
  }
}
