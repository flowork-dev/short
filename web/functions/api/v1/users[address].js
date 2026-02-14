//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\users[address].js total lines 23 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestGet(ctx) {
  try {
    await ctx.env.DB.exec(`CREATE TABLE IF NOT EXISTS users (addr TEXT PRIMARY KEY, name TEXT UNIQUE, bio TEXT, rep INT DEFAULT 0, ts INT)`); //
  } catch (e) {
     console.error("D1 users table creation failed:", e.message); // English Hardcode
     return new Response(JSON.stringify({ error: "Database binding error", message: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }

  try {
    const user = await ctx.env.DB.prepare("SELECT addr, name, bio, rep, ts FROM users WHERE addr = ? COLLATE NOCASE").bind(ctx.params.address).first(); //
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: {'Content-Type': 'application/json'} }); //
    return new Response(JSON.stringify(user), { status: 200, headers: {'Content-Type': 'application/json'} }); //
  } catch (e) {
    if (e.message.includes("no such table")) return new Response(JSON.stringify({ error: "User system inactive" }), { status: 404, headers: {'Content-Type': 'application/json'} }); //
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} }); //
  }
}
