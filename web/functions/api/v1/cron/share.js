//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\cron\share.js total lines 118 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

export async function onRequest(context) {
  const { env } = context;
  const token = env.TELEGRAM_BOT_TOKEN;
  const channelId = env.CHANNEL_ID;

  if (!token || !channelId) {
    return new Response("Config Error: Missing Token or Channel ID", { status: 500 });
  }

  try {
    let articles = await env.FLOWORK_CONTENT.get('articles_list', { type: "json" });

    if (!articles || articles.length === 0) {
      console.log("List utama kosong, mencoba scanning database...");

      const list = await env.FLOWORK_CONTENT.list({ prefix: "article:" });

      if (list.keys.length > 0) {
        articles = [];
        for (const key of list.keys) {
          const articleData = await env.FLOWORK_CONTENT.get(key.name, { type: "json" });
          if (articleData) {
            articles.push(articleData);
          }
        }

        if (articles.length > 0) {
           console.log(`Ditemukan ${articles.length} artikel tercecer. Memperbaiki database...`);
           await env.FLOWORK_CONTENT.put('articles_list', JSON.stringify(articles));
        }
      }
    }

    if (!articles || articles.length === 0) {
      return new Response("Database Benar-Benar Kosong. Tidak ada artikel sama sekali.", { status: 404 });
    }

    articles.sort((a, b) => (a.last_shared || 0) - (b.last_shared || 0));

    const selected = articles[0];

    let snippet = selected.content.replace(/<[^>]*>?/gm, '').substring(0, 250);
    if (snippet.length >= 250) snippet = snippet.substring(0, snippet.lastIndexOf(" ")) + "...";

    let caption = `<b>🔥 NEW INTEL DROP: ${selected.title.toUpperCase()}</b>\n\n`;
    caption += `${snippet}\n\n`;
    caption += `━━━━━━━━━━━━━━━━━\n`;
    caption += `📖 <b>BACA SELENGKAPNYA:</b>\n👉 https://flowork.cloud/read/${selected.slug}\n`;

    if (selected.tutorial && selected.tutorial.length > 5) {
        caption += `\n🎥 <b>NONTON TUTORIAL:</b>\n👉 ${selected.tutorial}\n`;
    }
    if (selected.applink && selected.applink.length > 5) {
        caption += `\n🚀 <b>AKSES APLIKASI:</b>\n👉 ${selected.applink}\n`;
    }

    caption += `━━━━━━━━━━━━━━━━━\n<i>#FloworkIntel #CyberSecurity #TipsTeknologi</i>`;

    console.log(`Mengirim: ${selected.title}`);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        photo: selected.image,
        caption: caption,
        parse_mode: 'HTML'
      })
    });

    const result = await res.json();

    if (result.ok) {
      await updateRotation(env, articles, selected);
      return new Response(JSON.stringify({ status: "SENT_PHOTO", title: selected.title }), { headers: { "Content-Type": "application/json" } });

    } else {
      const errDesc = result.description || "";
      if (errDesc.includes("wrong type") || errDesc.includes("wrong file") || errDesc.includes("image") || errDesc.includes("Bad Request")) {
         console.warn("Foto gagal, switch ke Text...");

         await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: channelId,
                text: caption,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            })
         });

         await updateRotation(env, articles, selected);
         return new Response(JSON.stringify({ status: "SENT_FALLBACK_TEXT", title: selected.title }), { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ status: "TELEGRAM_ERROR", detail: result }), { status: 500 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

async function updateRotation(env, articles, selectedArticle) {
    const index = articles.findIndex(a => a.slug === selectedArticle.slug);
    if (index !== -1) {
        articles[index].last_shared = Date.now();
        await env.FLOWORK_CONTENT.put(`article:${articles[index].slug}`, JSON.stringify(articles[index]));
    }
    await env.FLOWORK_CONTENT.put('articles_list', JSON.stringify(articles));
}
