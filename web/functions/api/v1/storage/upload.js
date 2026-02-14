//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\storage\upload.js total lines 42 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const userAddress = formData.get('user_address');

        if (!env.R2_BUCKET) {
            return new Response(JSON.stringify({
                error: "Infrastructure Fault",
                message: "R2_BUCKET binding is missing in Cloudflare Dashboard."
            }), { status: 500 });
        }

        if (!file || !userAddress) {
            return new Response(JSON.stringify({ error: "Missing Data" }), { status: 400 });
        }

        const fileId = crypto.randomUUID();
        const key = `neural-temp/${userAddress}/${fileId}-${file.name.replace(/\s+/g, '_')}`;

        await env.R2_BUCKET.put(key, file.stream(), {
            httpMetadata: { contentType: file.type },
        });

        const publicUrl = `https://dl.flowork.cloud/${key}`;

        return new Response(JSON.stringify({ success: true, url: publicUrl }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: `Neural Storage Fault: ${e.message}` }), { status: 500 });
    }
}
