//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\ghost-pixel\process.js total lines 134 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * GHOST PIXEL V2 - REAL ENCRYPTION
 * Lokasi: functions/api/v1/ghost-pixel/process.js
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
        const pixelsBase64 = formData.get('pixels');
        const secretMessage = formData.get('message');
        const password = formData.get('password'); // Ambil password dari user

        if (!pixelsBase64) throw new Error("No pixel data received");

        const binaryString = atob(pixelsBase64);
        const len = binaryString.length;
        const data = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            data[i] = binaryString.charCodeAt(i);
        }

        let resultData = { success: true, mode: mode };

        if (mode === 'encode') {
            if (!secretMessage) throw new Error("Pesan kosong!");

            let payload = "";

            if (password && password.trim() !== "") {
                const encryptedMsg = xorCipher(secretMessage, password);
                payload = "LOCK::" + encryptedMsg;
            } else {
                payload = "OPEN::" + secretMessage;
            }

            const binaryMsg = textToBinary(payload) + "00000000"; // Null terminator

            if (binaryMsg.length > data.length / 4) {
                throw new Error("Gambar kekecilan bro. Pesan kepanjangan.");
            }

            for (let i = 0; i < binaryMsg.length; i++) {
                let dataIndex = i * 4;
                data[dataIndex] = (data[dataIndex] & ~1) | parseInt(binaryMsg[i]);
            }

            let resultBinary = '';
            const chunkSize = 8192;
            for (let i = 0; i < len; i += chunkSize) {
                resultBinary += String.fromCharCode.apply(null, data.subarray(i, i + chunkSize));
            }
            resultData.resultPixels = btoa(resultBinary);

        }
        else {
            let binaryOutput = "";
            const maxScan = Math.min(data.length / 4, 150000); // Scan limit

            for (let i = 0; i < maxScan; i++) {
                let dataIndex = i * 4;
                binaryOutput += (data[dataIndex] & 1).toString();
            }

            let extractedText = "";
            for(let i=0; i<binaryOutput.length; i+=8) {
                let byte = binaryOutput.slice(i, i+8);
                if(byte === "00000000") break;
                extractedText += String.fromCharCode(parseInt(byte, 2));
            }

            if (extractedText.startsWith("OPEN::")) {
                resultData.decrypted = extractedText.replace("OPEN::", "");
                resultData.found = true;
            }
            else if (extractedText.startsWith("LOCK::")) {
                if (!password || password.trim() === "") {
                    resultData.found = false;
                    resultData.message = "GAMBAR TERKUNCI! Masukkan password untuk membaca.";
                } else {
                    const cipherText = extractedText.replace("LOCK::", "");
                    const decrypted = xorCipher(cipherText, password);

                    resultData.decrypted = decrypted;
                    resultData.found = true;
                }
            }
            else {
                resultData.found = false;
                resultData.message = "Tidak ada pesan rahasia ditemukan.";
            }
        }

        return new Response(JSON.stringify(resultData), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
