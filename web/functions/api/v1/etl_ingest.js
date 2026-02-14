//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\etl_ingest.js total lines 33 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = request.headers.get("Authorization") || "";
  if (!env.ETL_API_KEY || !auth.includes(env.ETL_API_KEY)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();
    const events = body.events || [];
    if (!events.length) return new Response(JSON.stringify({ stored: 0 }), { status: 200 });
    await env.DB.exec(`CREATE TABLE IF NOT EXISTS etl_events (id TEXT PRIMARY KEY, topic TEXT, payload TEXT, gateway_ts INTEGER, ingested_at INTEGER)`);

    const stmt = env.DB.prepare(`INSERT OR IGNORE INTO etl_events (id, topic, payload, gateway_ts, ingested_at) VALUES (?1, ?2, ?3, ?4, ?5)`);
    const now = Date.now();
    let successCount = 0;
    for (const e of events) {
       const p = typeof e.payload === 'object' ? JSON.stringify(e.payload) : String(e.payload);
       await stmt.bind(e.id, e.topic, p, e.ts || now, now).run();
       successCount++;
    }

    return new Response(JSON.stringify({ success: true, stored: successCount }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, type: "ETL_ERROR" }), { status: 500 });
  }
}
