//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\chaos-lens\process.js total lines 116 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * CHAOS LENS - SERVER ENGINE
 * Logic: Naor-Shamir Visual Cryptography (2-out-of-2)
 * Memecah 1 gambar menjadi 2 layer noise.
 */

function createBMP(width, height, data) {
    const headerSize = 54;
    const rowSize = Math.ceil((width * 3) / 4) * 4;
    const fileSize = headerSize + (rowSize * height);
    const buffer = new Uint8Array(fileSize);
    const view = new DataView(buffer.buffer);

    view.setUint16(0, 0x424D, false);
    view.setUint32(2, fileSize, true);
    view.setUint32(10, headerSize, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, -height, true); // Top-down
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);

    let offset = headerSize;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const a = data[i+3];
            const isBlack = (r < 128 && a > 128);
            const val = isBlack ? 0x00 : 0xFF;

            buffer[offset + x * 3] = val;
            buffer[offset + x * 3 + 1] = val;
            buffer[offset + x * 3 + 2] = val;
        }
        offset += rowSize;
    }

    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(buffer[i]);
    return "data:image/bmp;base64," + btoa(binary);
}

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const json = await context.request.json();
        const { width, height, pixels } = json;

        if (!pixels) throw new Error("Data pixel kosong.");

        const binaryString = atob(pixels);
        const len = binaryString.length;
        const sourceData = new Uint8Array(len);
        for (let i = 0; i < len; i++) sourceData[i] = binaryString.charCodeAt(i);

        const outWidth = width * 2;
        const outHeight = height;
        const layerA = new Uint8Array(outWidth * outHeight * 4);
        const layerB = new Uint8Array(outWidth * outHeight * 4);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const isBlack = sourceData[i+3] > 128 && sourceData[i] < 128;
                const rnd = Math.random() > 0.5;

                const outI1 = (y * outWidth + (x * 2)) * 4;
                const outI2 = (y * outWidth + (x * 2) + 1) * 4;

                const setP = (arr, idx, black) => {
                    const c = black ? 0 : 255;
                    arr[idx] = c;   arr[idx+1] = c; arr[idx+2] = c; arr[idx+3] = black ? 255 : 0;
                };

                if (rnd) {
                    setP(layerA, outI1, true); setP(layerA, outI2, false);
                } else {
                    setP(layerA, outI1, false); setP(layerA, outI2, true);
                }

                if (isBlack) {
                    if (rnd) { setP(layerB, outI1, false); setP(layerB, outI2, true); }
                    else { setP(layerB, outI1, true); setP(layerB, outI2, false); }
                } else {
                    if (rnd) { setP(layerB, outI1, true); setP(layerB, outI2, false); }
                    else { setP(layerB, outI1, false); setP(layerB, outI2, true); }
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            layerA: createBMP(outWidth, outHeight, layerA),
            layerB: createBMP(outWidth, outHeight, layerB)
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
    }
}
