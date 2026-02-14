//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\nexus-bio\publish.js total lines 38 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * NEXUS BIO - PUBLISHER ENGINE
 * Fitur: Save Data + Auto Expiration Setup (90 Hari)
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { handle, data } = body;

        if (!handle || handle.length < 3) {
            return new Response(JSON.stringify({ error: "Handle tidak valid (min 3 chars)" }), { status: 400 });
        }

        await env.GHOST_VAULT.put(`bio:${handle}`, JSON.stringify(data), {
            expirationTtl: 7776000
        });

        return new Response(JSON.stringify({
            success: true,
            handle: handle,
            message: "Bio berhasil dipublish! Expire dalam 3 bulan jika tidak ada trafik."
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
