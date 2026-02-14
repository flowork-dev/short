//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\keyword-mixer\process.js total lines 91 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * KEYWORD MIXER - SERVER SIDE PROCESSOR
 * Menangani permutasi string dan analisis kepadatan kata.
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
      const mode = formData.get('mode'); // 'mixer' atau 'density'

      let responseData = {};

      if (mode === 'mixer') {
        const colA = (formData.get('colA') || '').split('\n').map(s => s.trim()).filter(s => s);
        const colB = (formData.get('colB') || '').split('\n').map(s => s.trim()).filter(s => s);
        const colC = (formData.get('colC') || '').split('\n').map(s => s.trim()).filter(s => s);

        const types = JSON.parse(formData.get('types') || '{"broad":true}');
        let results = [];

        const listA = colA.length ? colA : [''];
        const listB = colB.length ? colB : [''];
        const listC = colC.length ? colC : [''];

        listA.forEach(a => {
            listB.forEach(b => {
                listC.forEach(c => {
                    const raw = `${a} ${b} ${c}`.trim().replace(/\s+/g, ' ');
                    if (!raw) return;

                    if (types.broad) results.push(raw);
                    if (types.phrase) results.push(`"${raw}"`);
                    if (types.exact) results.push(`[${raw}]`);
                });
            });
        });

        responseData = { result: results.join('\n'), count: results.length };
      }

      else if (mode === 'density') {
        const text = (formData.get('text') || '').toLowerCase();
        const keywords = (formData.get('keywords') || '').split('\n').map(s => s.trim().toLowerCase()).filter(s => s);

        const words = text.match(/\b\w+\b/g) || [];
        const totalWords = words.length;

        const analysis = keywords.map(target => {
            if(!target) return null;
            const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'g'); // Strict word boundary
            const count = (text.match(regex) || []).length;

            return {
                word: target,
                count: count,
                percent: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : 0
            };
        }).filter(Boolean).sort((a,b) => b.count - a.count);

        responseData = { analysis: analysis };
      }

      return new Response(JSON.stringify({
        success: true,
        data: responseData
      }), { status: 200, headers });

    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err.message
      }), { status: 500, headers });
    }
  }
