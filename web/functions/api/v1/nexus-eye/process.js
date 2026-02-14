//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\nexus-eye\process.js total lines 80 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * NEXUS EYE - SERVER SIDE DORKING ENGINE
 * Menyimpan database query Google Hacking (GHDB) agar tidak terekspos di client.
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
      const { category, dorkLabel, target } = await context.request.json();

      const DORK_DB = {
        "VULNERABILITY RECON": {
            "Directory Listing": "intitle:\"index of /\"",
            "Config Files": "filetype:env OR filetype:config OR filetype:ini",
            "SQL Dumps": "filetype:sql OR filetype:db",
            "Log Files": "filetype:log intext:password"
        },
        "SENSITIVE DOCUMENTS": {
            "Confidential PDF": "filetype:pdf \"confidential\" OR \"strictly confidential\"",
            "Excel Financials": "filetype:xls OR filetype:xlsx \"salary\" OR \"budget\"",
            "Word Proposals": "filetype:doc OR filetype:docx \"proposal\"",
            "Internal Slides": "filetype:ppt OR filetype:pptx \"internal use only\""
        },
        "INFRASTRUCTURE & IOT": {
            "Open Webcams": "intitle:\"webcamXP 5\"",
            "Printer Dashboards": "intitle:\"Printer Status\" OR inurl:\"printer/main.html\"",
            "Router Portals": "inurl:\"/login.html\" intitle:\"Router\""
        },
        "CREDENTIAL HARVEST": {
            "Password Lists": "filetype:txt \"password\" OR \"username\" OR \"credential\"",
            "SSH Private Keys": "filetype:pem OR filetype:key \"BEGIN PRIVATE KEY\""
        }
      };

      const baseQuery = DORK_DB[category]?.[dorkLabel];

      if (!baseQuery) {
        throw new Error("Dork definition not found in Neural Database.");
      }

      let finalQuery = baseQuery;
      let cleanTarget = (target || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

      if (cleanTarget) {
        finalQuery = `site:${cleanTarget} ${baseQuery}`;
      }

      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;

      return new Response(JSON.stringify({
        success: true,
        data: {
            url: googleUrl,
            query: finalQuery, // Dikirim balik untuk log history aja
            target: cleanTarget || "GLOBAL INTERNET"
        }
      }), { status: 200, headers });

    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err.message
      }), { status: 500, headers });
    }
  }
