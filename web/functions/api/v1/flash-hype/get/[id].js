//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\flash-hype\get\[id].js total lines 62 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * FLASH HYPE - DATA RETRIEVER (WITH TURBO CACHE)
 * 1 Juta Visitor? Gak Masalah!
 */

export async function onRequest(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",

        "Cache-Control": "public, max-age=30, s-maxage=60"
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers });
    }

    try {
        const id = context.params.id;

        if (!id) {
            return new Response(JSON.stringify({ error: "ID Missing" }), {
                status: 400,
                headers: { ...headers, "Content-Type": "application/json" }
            });
        }

        const data = await context.env.GHOST_VAULT.get(id);

        if (!data) {
            headers["Cache-Control"] = "public, max-age=10";

            return new Response(JSON.stringify({ error: "Promo Not Found or Expired" }), {
                status: 404,
                headers: { ...headers, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: JSON.parse(data)
        }), {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" }
        });

    } catch (err) {
        headers["Cache-Control"] = "no-store";

        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...headers, "Content-Type": "application/json" }
        });
    }
}
