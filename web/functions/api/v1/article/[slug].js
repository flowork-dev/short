//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\article\[slug].js total lines 38 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequest(context) {
  const { env, params } = context;
  const slug = params.slug;

  if (!env.FLOWORK_CONTENT) {
    return new Response(JSON.stringify({ error: "KV Binding Missing" }), { status: 500 });
  }

  try {
    const rawData = await env.FLOWORK_CONTENT.get('articles_list', { type: "json" });
    const articles = rawData || [];

    const article = articles.find(a => a.slug.toLowerCase() === slug.toLowerCase());

    if (!article) {
      return new Response(JSON.stringify({ error: "Artikel tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(article), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
