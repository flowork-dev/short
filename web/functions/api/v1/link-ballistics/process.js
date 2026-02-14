//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\link-ballistics\process.js total lines 80 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * LINK BALLISTICS - TRAFFIC DISTRIBUTION ENGINE
 * Generates client-side load balancing scripts for WhatsApp.
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
    const rawData = formData.get('data');
    const payload = JSON.parse(rawData); // { numbers: [], message: "", mode: "random"|"round_robin" }

    if (!payload.numbers || payload.numbers.length === 0) {
        throw new Error("Wajib masukkan minimal 1 nomor WhatsApp.");
    }


    const safeNumbers = payload.numbers.map(n => n.replace(/\D/g, '')).filter(n => n.length > 5);
    const encodedMsg = encodeURIComponent(payload.message || "Halo, saya mau order.");
    const mode = payload.mode || "random";

    let scriptLogic = "";

    if (mode === 'round_robin') {
        scriptLogic = `
        const i = parseInt(localStorage.getItem('lb_last_idx') || '-1');
        const next = (i + 1) % p.length;
        localStorage.setItem('lb_last_idx', next);
        target = p[next];
        `;
    } else {
        scriptLogic = `
        target = p[Math.floor(Math.random() * p.length)];
        `;
    }

    const generatedScript = `
<script>
(function() {
    const p = ${JSON.stringify(safeNumbers)};
    const m = "${encodedMsg}";
    let target;
    ${scriptLogic}
    const url = "https://wa.me/" + target + "?text=" + m;

    window.openRotator = function() { window.open(url, '_blank'); };
    console.log("Link Ballistics: Rotator Ready. Call openRotator() on click.");
})();
</script>
`;

    return new Response(JSON.stringify({
      success: true,
      result: generatedScript,
      preview_url: `https://wa.me/${safeNumbers[0]}?text=${encodedMsg}` // For testing
    }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers });
  }
}
