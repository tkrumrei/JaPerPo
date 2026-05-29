import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  let id, lat, lon

  // VERSUCH 1: Daten aus der URL lesen (GET)
  const url = new URL(req.url)
  id = url.searchParams.get('id')
  lat = url.searchParams.get('lat')
  lon = url.searchParams.get('lon')

  // VERSUCH 2: Wenn in der URL nichts war -> Body lesen (POST)
  if (!id || !lat || !lon) {
    try {
      const bodyText = await req.text()
      // Traccar sendet POST oft als Formular-Daten (id=999&lat=51...)
      const bodyParams = new URLSearchParams(bodyText)

      if (!id) id = bodyParams.get('id')
      if (!lat) lat = bodyParams.get('lat')
      if (!lon) lon = bodyParams.get('lon')

      // Falls es JSON war, versuchen wir das auch noch
      if (!id) {
        const jsonBody = JSON.parse(bodyText)
        id = jsonBody.id
        lat = jsonBody.lat
        lon = jsonBody.lon
      }
    } catch (e) {
      console.log("Konnte Body nicht lesen:", e)
    }
  }

  // Debugging-Log (damit du im Log-Tab siehst, was ankommt)
  console.log(`Empfangen - ID: ${id}, Lat: ${lat}, Lon: ${lon}`)

  if (!id || !lat || !lon) {
    return new Response("Missing params (checked URL & Body)", { status: 400 })
  }

  // Supabase verbinden
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Datenbank Update
  const { error } = await supabase
    .from('participants')
    .update({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      last_updated: new Date().toISOString()
    })
    .eq('start_number', parseInt(id))

  if (error) {
    console.error("DB Error:", error)
    return new Response("Database Error", { status: 500 })
  }

  return new Response("OK", { status: 200 })
})
