//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\obfuscator\process.js total lines 54 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * FLOWORK OBFUSCATOR - SERVER SIDE
 * Logika pengacakan kode ditaruh disini agar tidak bisa di-copy via HTTrack.
 * * Note: Untuk production, install library 'javascript-obfuscator' di worker.
 * Di contoh ini kita buat logika simulasi scrambling server-side.
 */

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") {
        return new Response(null, { headers });
    }

    try {
        const formData = await context.request.formData();
        const sourceCode = formData.get('code');
        const level = formData.get('level') || 'medium'; // White label option

        if (!sourceCode) throw new Error("Mana kodenya bro? Kosong nih.");


        let processed = sourceCode;

        processed = processed.replace(/var /g, "var _0x" + Math.random().toString(16).substr(2, 4) + " = ");
        processed = processed.replace(/const /g, "const _0x" + Math.random().toString(16).substr(2, 4) + " = ");

        const encoded = btoa(processed);
        const wrapper = `(function(_0x){eval(atob('${encoded}'))})()`;

        return new Response(JSON.stringify({
            success: true,
            result: wrapper,
            message: `Obfuscation Level ${level} Success!`
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), { status: 500, headers });
    }
}
