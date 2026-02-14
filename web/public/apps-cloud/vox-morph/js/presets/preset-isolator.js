//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-isolator.js total lines 53 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('isolator', 'Vox Isolator', (ctx, source, destination) => {


        const merger = ctx.createChannelMerger(1); // Paksa jadi 1 channel (Mono)

        const splitter = ctx.createChannelSplitter(2);
        source.connect(splitter);

        splitter.connect(merger, 0, 0); // L -> Mono
        splitter.connect(merger, 1, 0); // R -> Mono


        const hpf = ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 300;
        hpf.Q.value = 1;

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 3500;
        lpf.Q.value = 1;

        const presence = ctx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 2000;
        presence.Q.value = 1.5;
        presence.gain.value = 5;

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -30;
        compressor.knee.value = 40;
        compressor.ratio.value = 12; // Hard compression
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        const makeUpGain = ctx.createGain();
        makeUpGain.gain.value = 2.5; // Boost volume akhir

        merger.connect(hpf);
        hpf.connect(lpf);
        lpf.connect(presence);
        presence.connect(compressor);
        compressor.connect(makeUpGain);
        makeUpGain.connect(destination);
    });
}
