//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\sonic-vault\process.js total lines 105 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * SONIC VAULT - SERVER PROCESSOR
 * Lokasi: functions/api/v1/sonic-vault/process.js
 */

function xorCipher(text, key) {
    if (!key) return text;
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function textToBinary(text) {
    let output = "";
    for (let i = 0; i < text.length; i++) {
        let bin = text[i].charCodeAt(0).toString(2);
        output += "00000000".slice(bin.length) + bin;
    }
    return output;
}

function binaryToText(binary) {
    let output = "";
    for (let i = 0; i < binary.length; i += 8) {
        let byte = binary.slice(i, i + 8);
        output += String.fromCharCode(parseInt(byte, 2));
    }
    return output;
}

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
        const mode = formData.get('mode');
        const password = formData.get('password');

        if (mode === 'encode') {
            const message = formData.get('message');
            if (!message) throw new Error("Pesan kosong.");

            let finalPayload = "";
            if (password && password.trim() !== "") {
                const encrypted = xorCipher(message, password);
                finalPayload = "LOCK::" + encrypted + "::END";
            } else {
                finalPayload = "SONIC::" + message + "::END";
            }

            const binaryStream = textToBinary(finalPayload);

            return new Response(JSON.stringify({
                success: true,
                data: binaryStream,
                length: binaryStream.length
            }), { status: 200, headers });
        }

        else if (mode === 'decode') {
            const rawBinary = formData.get('binary');
            if (!rawBinary) throw new Error("No binary data.");

            const fullText = binaryToText(rawBinary);

            if (fullText.includes("SONIC::") && fullText.includes("::END")) {
                const cleanMsg = fullText.split("SONIC::")[1].split("::END")[0];
                return new Response(JSON.stringify({ success: true, message: cleanMsg, type: "OPEN" }), { status: 200, headers });
            }
            else if (fullText.includes("LOCK::") && fullText.includes("::END")) {
                if (!password || password.trim() === "") {
                    return new Response(JSON.stringify({ success: false, message: "Audio Terkunci! Masukkan Password." }), { status: 200, headers });
                }
                const cipherText = fullText.split("LOCK::")[1].split("::END")[0];
                const decrypted = xorCipher(cipherText, password);
                return new Response(JSON.stringify({ success: true, message: decrypted, type: "SECURE" }), { status: 200, headers });
            }
            else {
                return new Response(JSON.stringify({ success: false, message: "Tidak ada pesan rahasia di sini." }), { status: 200, headers });
            }
        }

        throw new Error("Invalid Mode: " + mode);

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
