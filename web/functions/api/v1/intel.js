/**
 * CLOUDFLARE WORKER: DATA INTELLIGENCE
 * Tugas: Baca KV dan rekap semua statistik app
 */
export async function onRequestGet({ request, env }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type, X-Secret-Key",
  };

  try {
    // 1. SECURITY CHECK (Password Sederhana)
    // Ambil password dari header request
    const secretKey = request.headers.get('X-Secret-Key');
    const mySecret = env.MOMOD_SECRET || "Aola-#1987"; // Default kalau lupa set env

    if (secretKey !== mySecret) {
      return new Response(JSON.stringify({ error: "ACCESS DENIED: WRONG KEY" }), {
        status: 401, headers: corsHeaders
      });
    }

    // 2. LIST SEMUA KEY DI KV (Prefix "stats:")
    // Limit default 1000 key, cukup buat sekarang
    const list = await env.FLOWORK_STATS.list({ prefix: "stats:" });

    // 3. FETCH NILAI DARI SETIAP KEY (Parallel Fetching)
    // Ini teknik ngebut: request semua data sekaligus
    const keys = list.keys;
    const pendingValues = keys.map(k => env.FLOWORK_STATS.get(k.name, { type: 'json' }));
    const values = await Promise.all(pendingValues);

    // 4. GABUNGIN DATA
    const report = keys.map((k, index) => {
      const stat = values[index] || { v: 0, c: 0, u: 0 };

      // Hitung Rasio Konversi & Popularitas
      const conversionRate = stat.v > 0 ? ((stat.c / stat.v) * 100).toFixed(1) : 0;

      // Skor Popularitas (Logic: Usage x 2 + Conversion)
      const score = (stat.u * 2) + stat.c;

      return {
        id: k.name.replace('stats:', ''), // Buang prefix 'stats:'
        v: stat.v || 0, // Visit
        c: stat.c || 0, // Conversion
        u: stat.u || 0, // Usage
        rate: conversionRate,
        score: score
      };
    });

    // 5. URUTKAN DARI YANG PALING POPULER (Usage Tertinggi)
    report.sort((a, b) => b.score - a.score);

    return new Response(JSON.stringify({
      data: report,
      total: report.length,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// Handle Preflight untuk CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, X-Secret-Key",
    }
  });
}