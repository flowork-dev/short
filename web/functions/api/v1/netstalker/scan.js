//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\netstalker\scan.js total lines 106 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequestGet(context) {
  const { request } = context;

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET"
  };

  const urlParams = new URL(request.url).searchParams;
  let domain = urlParams.get("domain");

  if (!domain) return new Response(JSON.stringify({ error: "MISSING_DOMAIN" }), { status: 400, headers: corsHeaders });

  domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const [dnsA, dnsMX, dnsNS, httpCheck, robotsCheck] = await Promise.all([
        fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, { headers: { 'accept': 'application/dns-json' } }).then(r => r.json()),
        fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, { headers: { 'accept': 'application/dns-json' } }).then(r => r.json()),
        fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=NS`, { headers: { 'accept': 'application/dns-json' } }).then(r => r.json()),
        fetch(`http://${domain}`, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Flowork-Scanner/2.1' } }).catch(() => ({ status: 500, headers: new Headers() })),
        fetch(`http://${domain}/robots.txt`, { method: 'GET' }).catch(() => ({ status: 404 }))
    ]);

    const ipAddress = dnsA.Answer ? dnsA.Answer[0].data : null;

    const secAudit = [];
    let securityScore = 100;
    const h = httpCheck.headers || new Headers();

    if (!h.get('x-frame-options') && !h.get('content-security-policy')) {
        secAudit.push({ severity: 'HIGH', type: 'Clickjacking', msg: 'Missing X-Frame-Options header.' });
        securityScore -= 20;
    }

    if (!h.get('strict-transport-security')) {
        secAudit.push({ severity: 'MED', type: 'SSL', msg: 'Missing HSTS header.' });
        securityScore -= 10;
    }

    if (h.get('x-content-type-options') !== 'nosniff') {
        secAudit.push({ severity: 'LOW', type: 'MIME', msg: 'Missing nosniff header.' });
        securityScore -= 5;
    }

    const serverHeader = h.get('server');
    const poweredBy = h.get('x-powered-by');
    if (serverHeader || poweredBy) {
        secAudit.push({ severity: 'INFO', type: 'Info Leak', msg: `Server exposed: ${serverHeader || ''} ${poweredBy || ''}` });
    }

    let robotsStatus = "Not Found";
    if (robotsCheck.status === 200) {
        try {
            const robotsText = await robotsCheck.text();
            robotsStatus = "Found";
            if (/admin|login|dashboard|config|env/i.test(robotsText)) {
                secAudit.push({ severity: 'LOW', type: 'Recon', msg: 'Sensitive paths found in robots.txt' });
            }
        } catch(e) { robotsStatus = "Unreadable"; }
    }

    let geo = { country: "Unknown", city: "Unknown", isp: "Unknown" };
    if(ipAddress) {
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`);
            const geoData = await geoRes.json();
            if(geoData.status === 'success') {
                geo = { country: geoData.country, city: geoData.city, isp: geoData.org };
            }
        } catch(e) {}
    }

    const report = {
        target: domain,
        ip: ipAddress || "Hidden",
        location: `${geo.city}, ${geo.country}`,
        isp: geo.isp,
        server: serverHeader || "Hidden",
        stack: [poweredBy, h.get('cf-ray') ? 'Cloudflare' : null].filter(Boolean),
        dns: {
            ns: dnsNS.Answer ? dnsNS.Answer.map(r => r.data) : [],
            mx: dnsMX.Answer ? dnsMX.Answer.map(r => r.data) : []
        },
        security: {
            score: Math.max(0, securityScore),
            grade: securityScore >= 90 ? 'A' : (securityScore >= 70 ? 'B' : (securityScore >= 50 ? 'C' : 'F')),
            audit: secAudit,
            robots: robotsStatus
        },
        status: httpCheck.status || 500
    };

    return new Response(JSON.stringify(report), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
