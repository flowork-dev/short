/**
 * CLOUDFLARE WORKER: FLOWORK ANALYTICS
 * Tugas: Nerima laporan -> Update Counter di KV
 */
export async function onRequestPost({ request, env }) {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // 1. Ambil Data
    const { appId, type } = await request.json();

    // Validasi simpel
    if (!appId || !['v', 'c', 'u'].includes(type)) {
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    // 2. Baca Data Lama (Key: "stats:nama-app")
    const key = `stats:${appId}`;
    // Pastikan env.FLOWORK_STATS sudah di-bind di Dashboard
    let stats = await env.FLOWORK_STATS.get(key, { type: "json" });

    if (!stats) stats = { v: 0, c: 0, u: 0 };

    // 3. Update Counter
    stats[type] = (stats[type] || 0) + 1;

    // 4. Simpan Balik (Background Process)
    await env.FLOWORK_STATS.put(key, JSON.stringify(stats));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Handle Preflight (CORS)
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}