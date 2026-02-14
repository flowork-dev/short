//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\idem\global.js total lines 31 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestPost(context) {
  const { request, env } = context;
  const keyHeader = request.headers.get("X-API-Key");
  if (!env.IDEM_API_KEY || keyHeader !== env.IDEM_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized IDEM" }), { status: 401 });
  }
  try {
    const { key, job_id, ttl = 3600 } = await request.json();
    if (!key || !job_id) return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });
    await env.DB.exec(`CREATE TABLE IF NOT EXISTS global_locks (key TEXT PRIMARY KEY, job_id TEXT, created_at INTEGER, expires_at INTEGER)`);
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare("DELETE FROM global_locks WHERE expires_at < ?").bind(now).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO global_locks (key, job_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)`).bind(key, job_id, now, now + ttl).run();
    const winner = await env.DB.prepare("SELECT job_id FROM global_locks WHERE key = ?").bind(key).first();
    if (!winner) {
        throw new Error("Fatal: Lock verified but not found");
    }
    return new Response(JSON.stringify({
      claimed: (winner.job_id === job_id),
      winner_job_id: winner.job_id
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, type: "IDEM_ERROR" }), { status: 500 });
  }
}
