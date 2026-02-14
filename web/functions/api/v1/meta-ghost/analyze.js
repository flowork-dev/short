//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\meta-ghost\analyze.js total lines 70 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * META GHOST - SERVER SIDE ANALYZER
 * Logic penilaian risiko privasi (Privacy Score).
 * Client cuma kirim metadata JSON, bukan file gambarnya (Privacy First).
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
      const { metadata } = await context.request.json();

      let riskScore = 0; // 0 = Aman, 100 = Bahaya
      let threats = [];
      let verdict = "SAFE";

      if (metadata.GPSLatitude || metadata.latitude) {
        riskScore += 65;
        threats.push("GEOLOCATION_EXPOSED");
      }

      if (metadata.Make || metadata.Model) {
        riskScore += 20;
        threats.push("DEVICE_FINGERPRINT");
      }

      if (metadata.Software) {
        riskScore += 10;
        threats.push("SOFTWARE_VERSION");
      }
      if (metadata.DateTimeOriginal) {
        riskScore += 5;
        threats.push("EXACT_TIMESTAMP");
      }

      if (riskScore >= 80) verdict = "CRITICAL";
      else if (riskScore >= 40) verdict = "WARNING";
      else verdict = "SECURE";

      return new Response(JSON.stringify({
        success: true,
        data: {
            score: riskScore,
            verdict: verdict,
            threats: threats,
            message: riskScore > 50 ? "Sumpah ini cepu banget datanya. Bahaya." : "Aman bestie, privasi terjaga."
        }
      }), { status: 200, headers });

    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err.message
      }), { status: 500, headers });
    }
  }
