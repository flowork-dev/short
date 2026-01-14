export async function onRequest(context) {
  const { params } = context;
  const id = params.id; // Ini adalah string Base64 nya

  // Default Fallback
  let target = "https://google.com";
  let title = "Link Preview";
  let desc = "Click to view";
  let img = "";

  try {
    // Decode Base64 (Support UTF-8)
    const cleanId = id.replace(/ /g, '+'); // Fix spasi jadi plus
    const jsonStr = new TextDecoder().decode(
        Uint8Array.from(atob(cleanId), c => c.charCodeAt(0))
    );
    const data = JSON.parse(jsonStr);

    if(data.u) target = data.u;
    if(data.t) title = data.t;
    if(data.d) desc = data.d;
    if(data.i) img = data.i;

    // Paksa HTTPS di URL & Image
    if(!target.startsWith('http')) target = 'https://' + target;
    if(img && !img.startsWith('http')) img = 'https://' + img;

  } catch (e) {
    // Kalau link rusak, biarin default
  }

  // HTML Sederhana tapi Powerfull buat Bot WA
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>

    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${target}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:secure_url" content="${img}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${img}">

    <meta http-equiv="refresh" content="0;url=${target}">
</head>
<body>
    <script>window.location.replace("${target}");</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html;charset=UTF-8" }
  });
}
