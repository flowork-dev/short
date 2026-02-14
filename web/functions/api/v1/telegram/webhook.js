//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\telegram\webhook.js total lines 461 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

import { ethers } from 'ethers';

const APP_REGISTRY = [
  { "id": "voice-jammer", "name": "Voice Jammer", "desc": "Lindungi suara kamu dari peniruan AI (Cloning).", "url": "https://flowork.cloud/app/voice-jammer", "tutorial": "https://www.youtube.com/watch?v=lmIAqEDSwxU" },
  { "id": "video-cloak", "name": "Video Cloak", "desc": "Anti Deepfake & manipulasi algoritma video.", "url": "https://flowork.cloud/app/video-cloak", "tutorial": "" },
  { "id": "ghost-pixel", "name": "Ghost Pixel", "desc": "Sembunyikan chat rahasia di dalam gambar.", "url": "https://flowork.cloud/app/ghost-pixel", "tutorial": "" },
  { "id": "format-shifter", "name": "Format Shifter", "desc": "Ubah format foto (JPG/PNG) jadi WebP super ringan.", "url": "https://flowork.cloud/app/format-shifter", "tutorial": "" },
  { "id": "sonic-vault", "name": "Sonic Vault", "desc": "Sisipkan pesan rahasia di dalam file lagu MP3.", "url": "https://flowork.cloud/app/sonic-vault", "tutorial": "" },
  { "id": "chaos-lens", "name": "Chaos Lens", "desc": "Enkripsi gambar menjadi noise acak (Anti Screenshot).", "url": "https://flowork.cloud/app/chaos-lens", "tutorial": "" },
  { "id": "phantom-text", "name": "Phantom Text", "desc": "Kirim pesan kosong yang berisi teks tersembunyi.", "url": "https://flowork.cloud/app/phantom-text", "tutorial": "" },
  { "id": "psych-ops", "name": "Psych Ops", "desc": "Analisa psikologi konsumen menggunakan AI.", "url": "https://flowork.cloud/app/psych-ops", "tutorial": "" },
  { "id": "geo-tactical", "name": "Geo Tactical", "desc": "Cari data lokasi bisnis dan kompetitor via peta.", "url": "https://flowork.cloud/app/geo-tactical", "tutorial": "" },
  { "id": "docu-synth", "name": "Docu-Synth", "desc": "Buat proposal & surat resmi otomatis dengan AI.", "url": "https://flowork.cloud/app/docu-synth", "tutorial": "" },
  { "id": "vision-cortex", "name": "Vision Cortex", "desc": "Ubah gambar/foto dokumen menjadi teks (OCR).", "url": "https://flowork.cloud/app/vision-cortex", "tutorial": "" },
  { "id": "business_canvas", "name": "Business Model Canvas", "desc": "Buat perencanaan bisnis startup profesional.", "url": "https://flowork.cloud/app/business-model-canvas", "tutorial": "" },
  { "id": "invoice-tactical", "name": "Invoice Tactical", "desc": "Buat invoice/tagihan profesional (Rupiah/USD).", "url": "https://flowork.cloud/app/invoice-tactical", "tutorial": "" },
  { "id": "search-recon", "name": "Search Recon", "desc": "Cek apakah website kamu sudah muncul di Google.", "url": "https://flowork.cloud/app/search-recon", "tutorial": "" },
  { "id": "yt-intel", "name": "Youtube Intel", "desc": "Intip estimasi gaji & tag rahasia YouTuber lain.", "url": "https://flowork.cloud/app/yt-intel", "tutorial": "" },
  { "id": "void-link", "name": "Void Link", "desc": "Kirim file besar tanpa batas via jaringan P2P.", "url": "https://flowork.cloud/app/void-link", "tutorial": "" },
  { "id": "keyword-mixer", "name": "Keyword Mixer", "desc": "Ramuan kata kunci untuk SEO & Iklan.", "url": "https://flowork.cloud/app/keyword-mixer", "tutorial": "" },
  { "id": "meta-ghost", "name": "Meta Ghost", "desc": "Hapus data lokasi (GPS) yang nempel di foto.", "url": "https://flowork.cloud/app/meta-ghost", "tutorial": "" },
  { "id": "trend-signal", "name": "Trend Signal", "desc": "Deteksi konten yang bakal viral lebih awal.", "url": "https://flowork.cloud/app/trend-signal", "tutorial": "" },
  { "id": "net-stalker", "name": "Net Stalker", "desc": "Cek lokasi server dan teknologi sebuah website.", "url": "https://flowork.cloud/app/net-stalker", "tutorial": "" },
  { "id": "pixel-ops", "name": "Pixel Ops", "desc": "Kecilkan ukuran foto sampai 90% tanpa pecah.", "url": "https://flowork.cloud/app/pixel-ops", "tutorial": "" },
  { "id": "qr-command", "name": "QR Command", "desc": "Buat QR Code keren dengan logo sendiri.", "url": "https://flowork.cloud/app/qr-command", "tutorial": "" },
  { "id": "type-ops", "name": "Type Ops", "desc": "Generator tulisan Bold/Italic untuk Sosmed.", "url": "https://flowork.cloud/app/type-ops", "tutorial": "" },
  { "id": "cipher-vault", "name": "Cipher Vault", "desc": "Kunci file rahasia dengan password militer.", "url": "https://flowork.cloud/app/cipher-vault", "tutorial": "" },
  { "id": "schema-forge", "name": "Schema Forge", "desc": "Buat kode SEO otomatis agar website mudah dicari.", "url": "https://flowork.cloud/app/schema-forge", "tutorial": "" },
  { "id": "syntax-breach", "name": "Syntax Breach", "desc": "Editor koding (HTML/JS) langsung di browser.", "url": "https://flowork.cloud/app/syntax-breach", "tutorial": "" },
  { "id": "pass-forge", "name": "Pass Forge", "desc": "Buat password acak yang susah ditebak hacker.", "url": "https://flowork.cloud/app/pass-forge", "tutorial": "" },
  { "id": "mark-command", "name": "Mark Command", "desc": "Penulis dokumen format Markdown.", "url": "https://flowork.cloud/app/mark-command", "tutorial": "" },
  { "id": "screen-intel", "name": "Screen Intel", "desc": "Rekam layar laptop gratis tanpa install aplikasi.", "url": "https://flowork.cloud/app/screen-intel", "tutorial": "" },
  { "id": "alias-forge", "name": "Alias Forge", "desc": "Buat data dumi (nama/alamat palsu) untuk privasi.", "url": "https://flowork.cloud/app/alias-forge", "tutorial": "" },
  { "id": "enigma-ops", "name": "Enigma Ops", "desc": "Penerjemah kode rahasia (Morse/Base64/Binary).", "url": "https://flowork.cloud/app/enigma-ops", "tutorial": "" },
  { "id": "shard-x", "name": "Shard X", "desc": "Pecah password warisan menjadi beberapa bagian.", "url": "https://flowork.cloud/app/shard-x", "tutorial": "" },
  { "id": "video-ghost", "name": "Video Ghost", "desc": "Sembunyikan file rahasia di dalam video MP4.", "url": "https://flowork.cloud/app/video-ghost", "tutorial": "" },
  { "id": "deadline-ghost", "name": "Deadline Ghost", "desc": "Buat file 'corrupt' untuk mengulur deadline tugas.", "url": "https://flowork.cloud/app/deadline-ghost", "tutorial": "" },
  { "id": "geo-mask", "name": "Geo Mask", "desc": "Ubah lokasi foto (GPS) untuk kebutuhan privasi.", "url": "https://flowork.cloud/app/geo-mask", "tutorial": "" },
  { "id": "glitch-armor", "name": "Glitch Armor", "desc": "Lindungi karya seni agar tidak dicuri AI.", "url": "https://flowork.cloud/app/glitch-armor", "tutorial": "" },
  { "id": "obfuscator", "name": "Code Cloak", "desc": "Amankan kode JavaScript agar tidak dicuri orang.", "url": "https://flowork.cloud/app/obfuscator", "tutorial": "" },
  { "id": "lp-ripper", "name": "LP Ripper", "desc": "Download Landing Page kompetitor (Bersih script).", "url": "https://flowork.cloud/app/lp-ripper", "tutorial": "" },
  { "id": "flash-hype", "name": "Flash Hype", "desc": "Buat halaman penawaran dengan hitung mundur.", "url": "https://flowork.cloud/app/flash-hype", "tutorial": "" },
  { "id": "cyber-voice", "name": "Cyber Voice", "desc": "Pengubah suara menjadi efek robot/hacker.", "url": "https://flowork.cloud/app/cyber-voice", "tutorial": "" },
  { "id": "data-nuke", "name": "Data Nuke", "desc": "Hapus file secara permanen (Tidak bisa dikembalikan).", "url": "https://flowork.cloud/app/data-nuke", "tutorial": "" },
  { "id": "nexus-link", "name": "Nexus Link", "desc": "Buat Link-in-Bio keren dengan gaya Hacker.", "url": "https://flowork.cloud/app/nexus-link", "tutorial": "" },
  { "id": "app-forge", "name": "The App Forge", "desc": "Generator struktur aplikasi web instan.", "url": "https://flowork.cloud/app/app-forge", "tutorial": "" },
  { "id": "cine-motion", "name": "Cine Motion Pro", "desc": "Ubah teks menjadi video sinematik dengan AI.", "url": "https://flowork.cloud/app/cine-motion", "tutorial": "" }
];

const DEFAULT_APPS = APP_REGISTRY.map(app => ({...app, last_shared: 0}));

const UI = {
  header: "🔥 <b>FLOWORK SYSTEM</b> 🔥\n━━━━━━━━━━━━━━━━━\n",
  footer: "\n━━━━━━━━━━━━━━━━━\n<i>Flowork Cloud - Tools Premium Gratis.</i>"
};


async function reply(chatId, text, token, replyToMsgId = null) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML', disable_web_page_preview: true, reply_to_message_id: replyToMsgId })
  }).catch(e => console.log(e));
}

async function replyWithBack(chatId, text, token, botUsername, isGroup) {
  const backBtn = isGroup
    ? { text: "🔙 Kembali ke Menu Utama", url: `https://t.me/${botUsername}?start=menu` }
    : { text: "🔙 Kembali ke Menu Utama", callback_data: "main_menu" };

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId, text: text, parse_mode: 'HTML', disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[backBtn]] }
    })
  });
}

async function replyPhotoWithBack(chatId, photoUrl, caption, token, botUsername, isGroup) {
  const backBtn = isGroup
    ? { text: "🔙 Kembali ke Menu Utama", url: `https://t.me/${botUsername}?start=menu` }
    : { text: "🔙 Kembali ke Menu Utama", callback_data: "main_menu" };

  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId, photo: photoUrl, caption: caption, parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[backBtn]] }
    })
  }).catch(e => replyWithBack(chatId, caption, token, botUsername, isGroup));
}

async function sendCleanCode(chatId, label, codeContent, token) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: `👇 <b>${label}</b> (Tekan untuk menyalin)`, parse_mode: 'HTML' })
  });
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: `<code>${codeContent}</code>`, parse_mode: 'HTML' })
  });
}

async function deleteMessage(chatId, messageId, token) {
  await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  });
}

async function replyWithInlineBtn(chatId, text, token, buttons) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId, text: text, parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons }
    })
  });
}

async function sendMainMenu(chatId, token, userFirstName, tier = "Guest") {
  let tierLabel = "Pengguna Baru";
  if (tier === 'donatur') tierLabel = "Donatur (VIP) 💎";
  if (tier === 'admin' || tier === 'super_admin') tierLabel = "Admin 👑";

  const menuText = `<b>📱 MENU UTAMA FLOWORK</b>\n${UI.header}Halo <b>${userFirstName}</b>!\nStatus Akun: <b>${tierLabel}</b>\n\nSilakan pilih menu di bawah ini:👇${UI.footer}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId, text: menuText, parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: "🔐 Dapatkan Kode Login" }, { text: "🛠 Daftar Aplikasi Gratis" }],
          [{ text: "💸 Donasi (Bantu Server)" }, { text: "✨ Request Aplikasi" }],
          [{ text: "🐛 Lapor Bug" }, { text: "❓ Bantuan / Menu" }]
        ],
        resize_keyboard: true
      }
    })
  });
}

function parseArticleTags(text) {
  const extract = (tag) => {
    const regex = new RegExp(`{${tag}}([\\s\\S]*?){\/${tag}}`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  let content = extract('article');
  if (!content) content = extract('articel');

  return {
    title: extract('title'),
    content: content,
    image: extract('cover'),
    applink: extract('applink'),
    tutorial: extract('tutorial')
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const token = env.TELEGRAM_BOT_TOKEN;
  const adminPass = env.ADMIN_PASSWORD || "admin123";
  const botUsername = "floworkos_bot";
  const url = new URL(request.url);

  if (request.method === "GET") {
    if (url.searchParams.get('mode') === 'setup') {
      const webhookUrl = `https://${url.hostname}${url.pathname}`;
      const currentApps = await env.FLOWORK_CONTENT.get('registry');
      if (!currentApps) await env.FLOWORK_CONTENT.put('registry', JSON.stringify(DEFAULT_APPS));
      await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
      return new Response(JSON.stringify({ status: "READY" }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("System Online.", { status: 200 });
  }

  try {
    if (!token) return new Response("Token Missing", { status: 500 });
    const body = await request.json();

    if (body.callback_query) {
      const callbackId = body.callback_query.id;
      const chatId = body.callback_query.message.chat.id;
      const data = body.callback_query.data;
      const user = body.callback_query.from;

      if (data === "admin_create_again") {
         const adminSessionKey = `session_admin:${user.id}`;
         await env.FLOWORK_USERS.put(adminSessionKey, 'wait_data');
         await reply(chatId, `🚀 <b>MODE PEMBUATAN ARTIKEL</b>\nSilakan kirim format artikelnya lagi...`, token);
      }
      else if (data === "admin_logout") {
         const adminSessionKey = `session_admin:${user.id}`;
         await env.FLOWORK_USERS.delete(adminSessionKey);
         await reply(chatId, "✅ <b>Logout Admin Berhasil.</b>", token);
      }
      else if (data === "main_menu") {
        const userKV = await env.FLOWORK_USERS.get(`user:${user.id}`, { type: "json" });
        const tier = userKV ? userKV.tier : "Guest";
        await sendMainMenu(chatId, token, user.first_name, tier);
      }

      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ callback_query_id: callbackId })
      });
      return new Response("OK");
    }

    if (!body.message) return new Response("OK");

    const chatId = body.message.chat.id;
    const userId = body.message.from.id;
    const msgId = body.message.message_id;
    const chatType = body.message.chat.type;
    const isGroup = chatType !== 'private';
    const userFirstName = body.message.from.first_name || "Kawan";
    const text = body.message.text ? body.message.text.trim() : "";

    const adminSessionKey = `session_admin:${userId}`;
    let adminState = await env.FLOWORK_USERS.get(adminSessionKey);

    if (adminState === 'wait_pass') {
        if (text === adminPass) {
            await env.FLOWORK_USERS.put(adminSessionKey, 'wait_data');
            await reply(chatId, `✅ <b>LOGIN ADMIN SUKSES!</b>\n\nSilakan kirim format:\n\n<code>{title} Judul {/title}\n{article} Isi Artikel {/article}\n{cover} Link Gambar {/cover}\n{applink} Link App {/applink}\n{tutorial} Link Youtube {/tutorial}</code>`, token);
        } else {
            await env.FLOWORK_USERS.delete(adminSessionKey);
            await reply(chatId, `❌ <b>PASSWORD SALAH!</b> Akses ditolak.`, token);
        }
        return new Response("OK");
    }

    if (adminState === 'wait_data') {
        if (text === '/batalkan' || text === '/selesai') {
             await env.FLOWORK_USERS.delete(adminSessionKey);
             await reply(chatId, "✅ <b>Sesi Admin Berakhir.</b>", token);
             return new Response("OK");
        }

        if (text.length > 3900) {
             await reply(chatId, `⚠️ <b>PERINGATAN TELEGRAM LIMIT!</b>\nPesan lu ${text.length} karakter. Hati-hati kepotong! Pastikan penutup tag <code>{/article}</code> ada di pesan ini.`, token);
        }

        const data = parseArticleTags(text);

        let errorMsg = [];
        if (!data.title) errorMsg.push("- Tag {title}...{/title} tidak ditemukan.");
        if (!data.content) errorMsg.push("- Tag {article}...{/article} tidak ditemukan.");

        if (errorMsg.length > 0) {
             await reply(chatId, `❌ <b>GAGAL BACA FORMAT!</b>\nMasalah:\n${errorMsg.join("\n")}\n\n<b>Tips:</b>\n1. Pastikan tag penutup pake garis miring <code>/</code> (contoh: <code>{/article}</code>)\n2. Jika artikel sangat panjang, Telegram mungkin memotong pesanmu jadi 2 bagian (split). Coba kirim versi pendek dulu untuk tes.`, token);
             return new Response("OK");
        }

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newArticle = {
            id: crypto.randomUUID(),
            title: data.title,
            slug: slug,
            content: data.content,
            image: data.image || "https://flowork.cloud/images/cover_default.webp",
            applink: data.applink || "",
            tutorial: data.tutorial || "",
            author: userFirstName,
            created_at: Date.now()
        };

        let articles = await env.FLOWORK_CONTENT.get('articles_list', { type: "json" });
        if (!articles) articles = [];
        articles.unshift(newArticle);

        await env.FLOWORK_CONTENT.put('articles_list', JSON.stringify(articles));
        await env.FLOWORK_CONTENT.put(`article:${slug}`, JSON.stringify(newArticle));

        await env.FLOWORK_USERS.put(adminSessionKey, 'standby');

        await reply(chatId, `✅ <b>ARTIKEL SUKSES TERBIT!</b>\n\n<b>Judul:</b> ${data.title}\n🔗 <b>Link:</b> https://flowork.cloud/read/${slug}\n\nMau ngapain lagi bos?`, token);

        const nextBtns = [
            [{ text: "📝 Buat Lagi", callback_data: "admin_create_again" }],
            [{ text: "✅ Selesai (Logout)", callback_data: "admin_logout" }]
        ];
        await replyWithInlineBtn(chatId, "Pilih aksi:", token, nextBtns);
        return new Response("OK");
    }

    if (text === '/createagain') {
        if (adminState) {
            await env.FLOWORK_USERS.put(adminSessionKey, 'wait_data');
            await reply(chatId, `🚀 <b>MODE ARTIKEL</b>\nSilakan kirim formatnya lagi...`, token);
        } else {
            await reply(chatId, `⚠️ Sesi habis. Login ulang /createarticle`, token);
        }
        return new Response("OK");
    }

    if (text === '/selesai' || text === '/batalkan') {
        if (adminState) {
            await env.FLOWORK_USERS.delete(adminSessionKey);
            await reply(chatId, "✅ <b>Logout Berhasil.</b>", token);
        }
        return new Response("OK");
    }

    if (isGroup && text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = text.match(urlRegex);
        if (links) {
            let isSafe = false;
            for (const link of links) {
                if (link.includes('flowork.cloud')) { isSafe = true; break; }
            }
            if (!isSafe) {
                await deleteMessage(chatId, msgId, token);
                return new Response("OK");
            }
        }
    }

    if (text === '/createarticle') {
        if (chatType !== 'private') {
            await reply(chatId, "⚠️ PM bot dulu bos.", token);
            return new Response("OK");
        }
        await env.FLOWORK_USERS.put(adminSessionKey, 'wait_pass');
        await reply(chatId, `🔒 <b>LOGIN ADMIN</b>\nMasukkan password:`, token);
        return new Response("OK");
    }

    if (body.message.new_chat_members) {
      for (const member of body.message.new_chat_members) {
        if (member.is_bot && member.username === botUsername) continue;
        const welcomeText = `<b>👋 Halo, ${member.first_name}!</b>\n\nSelamat datang di keluarga besar <b>https://flowork.cloud</b>.\n\n<b>Visi Misi Kami:</b>\nMembantu UKM, Influencer, dan Kreator agar bisa menggunakan tools canggih secara GRATIS dan menghemat biaya langganan tools premium di luar sana.\n\nUntuk mulai menggunakan tools, silakan ambil akses di bawah ini. lalu masuh ke https://flowork.cloud/login`;
        const targetUrl = `https://t.me/${botUsername}?start=register`;
        await replyWithInlineBtn(chatId, welcomeText, token, [[{ text: "🔐 Ambil Akses Gratis", url: targetUrl }]]);
      }
      return new Response("OK");
    }

    if (text === '/checkid') {
        await reply(chatId, `🆔 <b>ID GROUP:</b> <code>${chatId}</code>`, token, msgId);
        return new Response("OK");
    }

    if (text === '/register' || text === '🔐 Dapatkan Kode Login') {
      if (chatType === 'private') {
        const existingUser = await env.FLOWORK_USERS.get(`user:${userId}`, { type: "json" });

        if (existingUser) {
          await reply(chatId, `<b>✋ KAMU SUDAH PUNYA AKUN</b>\n${UI.header}Satu akun Telegram hanya boleh memiliki satu Identitas Login.\n\n<b>Ini Kunci Login Kamu:</b>`, token);
          await sendCleanCode(chatId, "Public ID", existingUser.address, token);
          await sendCleanCode(chatId, "KUNCI RAHASIA", existingUser.privateKey, token);
          await replyWithBack(chatId, `👆 Gunakan kunci di atas untuk login di website flowork.cloud`, token, botUsername, isGroup);
        } else {
          const wallet = ethers.Wallet.createRandom();
          const newUser = {
            telegram_id: userId,
            username: body.message.from.username || "no_user",
            address: wallet.address,
            privateKey: wallet.privateKey,
            tier: "login",
            created_at: Date.now()
          };
          await env.FLOWORK_USERS.put(`user:${userId}`, JSON.stringify(newUser));
          await reply(chatId, `<b>✅ AKUN BERHASIL DIBUAT</b>\n${UI.header}Selamat bergabung! Ini adalah data login kamu.\n`, token);
          await sendCleanCode(chatId, "Public ID", wallet.address, token);
          await sendCleanCode(chatId, "KUNCI RAHASIA", wallet.privateKey, token);
          await replyWithBack(chatId, `👆 <b>Cara Pakai:</b>\nSalin "Kunci Rahasia" di atas, lalu tempel di halaman login website.`, token, botUsername, isGroup);
        }
      } else {
        const targetUrl = `https://t.me/${botUsername}?start=register`;
        await replyWithInlineBtn(chatId, `⚠️ <b>Demi Keamanan!</b>\nJangan minta kode login di grup. Cek pesan pribadi (PM).`, token, [[{ text: "📩 Buka Pesan Pribadi", url: targetUrl }]]);
      }
    }

    else if (text === '/tools' || text === '🛠 Daftar Aplikasi Gratis' || text === '/apps') {
      let apps = await env.FLOWORK_CONTENT.get('registry', { type: "json" });
      if (!apps || apps.length === 0) apps = DEFAULT_APPS;

      const chunkSize = 10;
      await reply(chatId, `${UI.header}Daftar aplikasi Flowork:`, token);

      for (let i = 0; i < apps.length; i += chunkSize) {
        const chunk = apps.slice(i, i + chunkSize);
        let message = "";
        chunk.forEach(app => {
          message += `🚀 <b>${app.name}</b>\n`;
          message += `└ ${app.desc}\n`;
          message += `🔗 <a href="${app.url}">Buka Aplikasi</a>`;
          if (app.tutorial && app.tutorial !== "") message += ` | 🎥 <a href="${app.tutorial}">Tutorial</a>`;
          message += `\n\n`;
        });
        await reply(chatId, message, token);
      }
      await replyWithBack(chatId, `🔥 <b>Total ${apps.length} Aplikasi siap pakai!</b>`, token, botUsername, isGroup);
    }

    else if (text === '/donate' || text === '💸 Donasi (Bantu Server)') {
      const caption = `<b>🤝 MARI SALING MEMBANTU</b>\n\nKawan Flowork, biaya server Cloudflare & AI Engine makin besar seiring bertambahnya user.\n\nKami berkomitmen agar Flowork tetap <b>GRATIS</b>. Jika aplikasi ini membantu cuanmu, mohon sisihkan sedikit rejeki untuk "memperpanjang nafas" server ini.\n\n<i>Nominal berapapun sangat berarti.</i> ❤️`;
      await replyPhotoWithBack(chatId, "https://flowork.cloud/images/donate.png", caption, token, botUsername, isGroup);
    }

    else if (text === '/request' || text === '✨ Request Aplikasi') {
      const userKV = await env.FLOWORK_USERS.get(`user:${userId}`, { type: "json" });
      const tier = userKV ? userKV.tier : "login";
      const intro = `<b>💡 KOMITMEN KAMI</b>\nKami rilis minimal <b>2 Aplikasi Baru</b> tiap minggu.\n\n`;

      if (tier === 'donatur' || tier === 'admin' || tier === 'super_admin') {
        const msg = `${intro}Karena kamu <b>Donatur</b>, requestmu adalah prioritas.\nKirim detail aplikasi ke email: 👉 <b>reqapp@flowork.cloud</b>`;
        await replyWithBack(chatId, msg, token, botUsername, isGroup);
      } else {
        const msg = `${intro}Maaf, Request Aplikasi Khusus hanya untuk Donatur. Tapi tenang, update rutin tetap jalan untuk semua!`;
        await replyWithBack(chatId, msg, token, botUsername, isGroup);
      }
    }

    else if (text === '/bug' || text === '🐛 Lapor Bug' || text === '/report') {
        const msg = `<b>🐛 LAPORAN BUG / ERROR</b>\n\nMenemukan fitur yang rusak atau error? Bantu kami memperbaikinya!\n\nSilakan kirim detail masalah & screenshot ke email:\n👉 <b>bug@flowork.cloud</b>\n\n<i>Tim teknis kami akan segera melakukan perbaikan. Terima kasih!</i>`;
        await replyWithBack(chatId, msg, token, botUsername, isGroup);
    }

    else if (text.startsWith('/start')) {
      const args = text.split(' ');
      const userKV = await env.FLOWORK_USERS.get(`user:${userId}`, { type: "json" });
      const currentTier = userKV ? userKV.tier : "login";

      if (args[1] === 'register') {
        await replyWithInlineBtn(chatId, "Klik tombol di bawah:", token, [[{ text: "🔐 Lihat Kode Login Saya", callback_data: "main_menu" }]]);
      } else {
        await sendMainMenu(chatId, token, userFirstName, currentTier);
      }
    }

    else if (text === '/status' || text === '📊 Status Server') {
      let apps = await env.FLOWORK_CONTENT.get('registry', { type: "json" });
      const count = apps ? apps.length : 0;
      await replyWithBack(chatId, `<b>📊 STATUS SISTEM</b>\n✅ Server: Online\n✅ Apps: ${count}\n✅ Satpam: Aktif`, token, botUsername, isGroup);
    }

    else if (text === '/help' || text === '❓ Bantuan / Menu' || text === '/menu') {
      const userKV = await env.FLOWORK_USERS.get(`user:${userId}`, { type: "json" });
      await sendMainMenu(chatId, token, userFirstName, userKV ? userKV.tier : "login");
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    return new Response(err.message, { status: 200 });
  }
}
