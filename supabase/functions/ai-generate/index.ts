// Supabase Edge Function: ai-generate
// Aufruf vom Frontend mit { userId, action, payload }
// - haelt Gemini-API-Key geheim
// - Rate Limit ueber ai_usage Tabelle (100 calls / user / Stunde)
// - response_mime_type=application/json fuer strukturierte Outputs

import { createClient } from 'npm:@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';
const RATE_LIMIT_PER_HOUR = Number(Deno.env.get('RATE_LIMIT_PER_HOUR') ?? '100');

// Diagnose beim Start — taucht in den Function-Logs auf.
console.log('[ai-generate] booted', {
  hasGeminiKey: !!GEMINI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
  model: GEMINI_MODEL,
  rateLimitPerHour: RATE_LIMIT_PER_HOUR,
});

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
  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(
      { ok: false, error: 'Edge Function nicht konfiguriert (Secrets fehlen).' },
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
    ({ prompt, schema } = buildPrompt(body.action, body.payload));
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 400);
  }

  // Gemini-Aufruf
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const generationConfig: Record<string, unknown> = {
    temperature: body.action === 'chat' ? 0.9 : 0.7,
  };
  if (schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = schema;
  }

  const geminiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  if (!geminiRes.ok) {
    const text = await geminiRes.text();
    return json(
      { ok: false, error: `Gemini-Fehler ${geminiRes.status}: ${text.slice(0, 500)}` },
      502,
    );
  }

  const geminiJson = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  let data: unknown = text;
  if (schema) {
    try {
      data = JSON.parse(text);
    } catch {
      return json({ ok: false, error: 'KI-Antwort war kein gueltiges JSON.' }, 502);
    }
  }

  // Usage protokollieren
  await admin.from('ai_usage').insert({
    user_id: body.userId,
    endpoint: body.action,
    tokens_in: geminiJson.usageMetadata?.promptTokenCount ?? null,
    tokens_out: geminiJson.usageMetadata?.candidatesTokenCount ?? null,
  });

  return json({ ok: true, data });
});

// ============================================================
// Prompts
// ============================================================

function buildPrompt(
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
      return {
        prompt:
          `Generiere ${count} Vokabeln in ${langLabel} fuer Niveau ${level}, Thema "${topic}". ` +
          `Fuer ${langLabel} gib Wort in Originalschrift, deutsche Uebersetzung, lateinische Lautschrift und einen Beispielsatz. ` +
          `Antworte ausschliesslich als JSON-Array.`,
        schema: {
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
      };
    }
    case 'dialogue': {
      const scenario = String(payload.scenario ?? 'Restaurant');
      const level = String(payload.level ?? 'A1');
      return {
        prompt:
          `Erstelle einen kurzen Lerndialog in ${langLabel} fuer Niveau ${level}, Szenario "${scenario}". ` +
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
      return {
        prompt:
          `Schreibe einen kurzen Lesetext in ${langLabel} fuer Niveau ${level} zum Thema "${topic}". ` +
          `Mindestens ${minWords} Woerter. Antworte als JSON-Objekt.`,
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
      return {
        prompt:
          `Erzeuge einen Lueckentext in ${langLabel} fuer Niveau ${level}. ` +
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
      return {
        prompt:
          `Du bist ein freundlicher Sprachpartner fuer ${langLabel}. ` +
          `Antworte in ${langLabel} (max 2-3 Saetze) und fuege darunter eine kurze deutsche Erklaerung an. ` +
          `Bisheriger Verlauf:\n${historyText}\n\nNutzer: ${message}`,
      };
    }
    case 'grammar': {
      const topic = String(payload.topic ?? 'Grammatik');
      const level = String(payload.level ?? 'A1');
      return {
        prompt:
          `Erklaere die Grammatikthema "${topic}" in ${langLabel} (Niveau ${level}) auf Deutsch, ` +
          `kurz und mit 3 Beispielsaetzen in Originalschrift + Lautschrift + Uebersetzung. ` +
          `Antworte als JSON-Objekt.`,
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
      return {
        prompt:
          `Erzeuge einen Test (${type}) in ${langLabel} fuer Niveau ${level} mit ${count} Fragen. ` +
          `Antworte als JSON-Objekt.`,
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
