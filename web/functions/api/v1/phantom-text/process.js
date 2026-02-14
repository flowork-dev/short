//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\phantom-text\process.js total lines 95 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * PHANTOM TEXT - SERVER SIDE STEGANOGRAPHY
 * Menyisipkan pesan rahasia ke dalam teks biasa menggunakan Zero Width Characters.
 * Logic:
 * 1. Convert Secret Message -> Binary
 * 2. 0 -> Zero Width Non-Joiner (U+200C)
 * 3. 1 -> Zero Width Joiner (U+200D)
 * 4. Inject di setelah karakter pertama Public Message.
 */

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const formData = await context.request.formData();
        const mode = formData.get('mode'); // 'hide' or 'reveal'

        const Z_ZERO = "\u200C"; // Mewakili bit 0
        const Z_ONE = "\u200D";  // Mewakili bit 1

        if (mode === 'hide') {
            const publicMsg = formData.get('public') || " ";
            const secretMsg = formData.get('secret');

            if (!secretMsg) throw new Error("Pesan rahasia kosong");

            let binary = "";
            for (let i = 0; i < secretMsg.length; i++) {
                binary += secretMsg[i].charCodeAt(0).toString(2).padStart(8, '0');
            }

            let hiddenStr = "";
            for (let i = 0; i < binary.length; i++) {
                hiddenStr += (binary[i] === '1') ? Z_ONE : Z_ZERO;
            }

            const result = publicMsg.length > 0
                ? publicMsg.charAt(0) + hiddenStr + publicMsg.slice(1)
                : hiddenStr;

            return new Response(JSON.stringify({
                success: true,
                result: result
            }), { status: 200, headers });
        }

        else if (mode === 'reveal') {
            const rawText = formData.get('text');
            if (!rawText) throw new Error("Teks kosong");

            let binary = "";
            for (let i = 0; i < rawText.length; i++) {
                if (rawText[i] === Z_ONE) binary += "1";
                else if (rawText[i] === Z_ZERO) binary += "0";
            }

            if (binary.length > 0 && binary.length % 8 === 0) {
                let decoded = "";
                for (let i = 0; i < binary.length; i += 8) {
                    decoded += String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
                }

                return new Response(JSON.stringify({
                    success: true,
                    found: true,
                    message: decoded
                }), { status: 200, headers });
            } else {
                return new Response(JSON.stringify({
                    success: true,
                    found: false,
                    message: "Tidak ada pesan tersembunyi."
                }), { status: 200, headers });
            }
        }

        throw new Error("Mode tidak valid");

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
