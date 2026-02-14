//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-helium.js total lines 35 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('helium', 'Helium Chipmunk', (ctx, source, destination) => {

        const hpf = ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 1000;
        hpf.Q.value = 0.5;

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.value = 2500;
        peak.Q.value = 3; // Lebih tajam
        peak.gain.value = 20; // Boost gila-gilaan

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -30;
        comp.knee.value = 40;
        comp.ratio.value = 12;

        const makeup = ctx.createGain();
        makeup.gain.value = 2.0; // Kompensasi volume hilang

        source.connect(hpf);
        hpf.connect(peak);
        peak.connect(comp); // Safety
        comp.connect(makeup);
        makeup.connect(destination);
    });
}
