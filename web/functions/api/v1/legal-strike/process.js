export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();

    const { type, myName, targetName, amount, date } = body;

    // FORMATTER
    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let title = "";
    let content = "";

    if (type === 'somasi') {
        title = "SOMASI & PERINGATAN HUKUM";
        // PAKE TAG HTML <b> BIAR BOLD DI PREVIEW
        content = `Kepada Yth.
<b>${targetName.toUpperCase()}</b>

Dengan hormat,

Saya yang bertanda tangan di bawah ini, <b>${myName.toUpperCase()}</b>, bertindak sebagai Pihak Yang Dirugikan ("Kreditur").

Melalui surat ini, saya menyampaikan TEGURAN KERAS (SOMASI) kepada Saudara terkait kewajiban pembayaran yang telah jatuh tempo dan belum diselesaikan sebesar:

<b>${formatRupiah(amount)}</b>

Fakta hukum adalah sebagai berikut:
1. Bahwa Saudara telah terikat kesepakatan/transaksi pada tanggal ${date}.
2. Bahwa hingga surat ini diterbitkan (Tahun 2026), Saudara belum memenuhi kewajiban prestasi.
3. Bahwa tindakan tersebut memenuhi unsur <b>WANPRESTASI</b> sebagaimana diatur dalam <b>Pasal 1238 dan 1243 KUHPerdata</b>.

Saya memberikan tenggat waktu <b>3x24 JAM</b> sejak surat ini dikirimkan via elektronik untuk melunasi seluruh kewajiban.

Apabila diabaikan, saya akan segera memproses gugatan perdata serta laporan pidana atas dugaan tindak pidana Penipuan/Penggelapan (Pasal 372/378 KUHP) tanpa pemberitahuan lebih lanjut.

Hormat Saya,

<b>${myName.toUpperCase()}</b>
Jakarta, ${today}`;
    }
    else if (type === 'nda') {
        title = "PERJANJIAN KERAHASIAAN (NDA)";
        content = `PIHAK PERTAMA (PEMILIK): <b>${myName.toUpperCase()}</b>
PIHAK KEDUA (PENERIMA): <b>${targetName.toUpperCase()}</b>

TANGGAL EFEKTIF: ${today}

<b>PASAL 1: DEFINISI INFORMASI</b>
Seluruh data, ide, strategi, kode sumber, dan aset digital yang diserahkan adalah RAHASIA DAGANG yang dilindungi <b>UU No. 30 Tahun 2000</b> dan Data Pribadi sesuai <b>UU Pelindungan Data Pribadi (UU PDP)</b>.

<b>PASAL 2: LARANGAN PENGUNGKAPAN</b>
Pihak Kedua DILARANG KERAS menyalin, menyebarkan, atau menggunakan informasi tersebut untuk keuntungan pribadi atau kompetitor tanpa izin tertulis.

<b>PASAL 3: SANKSI & DENDA</b>
Pelanggaran atas perjanjian ini akan dikenakan sanksi perdata berupa ganti rugi materiil sekurang-kurangnya <b>${formatRupiah(amount || 1000000000)}</b> serta tuntutan pidana sesuai hukum Negara Republik Indonesia.

Disepakati secara sadar oleh,

${myName.toUpperCase()} (Pihak Pertama)
${targetName.toUpperCase()} (Pihak Kedua)`;
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: title,
        body: content,
        generatedId: `LAW-${Date.now().toString().slice(-6)}-2026`,
        timestamp: today
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}