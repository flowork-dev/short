//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\nexus-bio\get.js total lines 23 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const handle = url.searchParams.get('handle');

    if (!handle) return new Response(JSON.stringify({ error: "Handle empty" }), { status: 400 });

    try {
        const rawData = await context.env.GHOST_VAULT.get(`bio:${handle}`);
        if (!rawData) return new Response(JSON.stringify({ error: "Bio not found in DB" }), { status: 404 });

        return new Response(JSON.stringify({ success: true, data: JSON.parse(rawData) }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
