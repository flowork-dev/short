//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\nexus\publish.js total lines 30 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestPost(context) {
  try {
    const { handle, encryptedData, pin } = await context.request.json();

    if (!handle || !encryptedData) {
      return new Response("Data tidak lengkap", { status: 400 });
    }

    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanHandle.length < 3) return new Response("Handle terlalu pendek", { status: 400 });

    const existing = await context.env.NEXUS_DATA.get(cleanHandle);


    await context.env.NEXUS_DATA.put(cleanHandle, encryptedData);

    return new Response(JSON.stringify({ success: true, handle: cleanHandle }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
