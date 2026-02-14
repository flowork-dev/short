//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-hive.js total lines 60 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('hive_queen', 'Hive Queen', (ctx, source, destination) => {

        const merger = ctx.createChannelMerger(2);

        const delayL = ctx.createDelay();
        delayL.delayTime.value = 0.01; // 10ms base

        const lfoL = ctx.createOscillator();
        lfoL.type = 'sine';
        lfoL.frequency.value = 0.5; // Slow swirl
        lfoL.start(0);

        const gainL = ctx.createGain();
        gainL.gain.value = 0.003; // Modulation depth

        lfoL.connect(gainL);
        gainL.connect(delayL.delayTime);

        const panL = ctx.createStereoPanner();
        panL.pan.value = -1; // Full Left

        const delayR = ctx.createDelay();
        delayR.delayTime.value = 0.015; // Beda base dikit

        const lfoR = ctx.createOscillator();
        lfoR.type = 'triangle';
        lfoR.frequency.value = 0.4; // Beda speed dikit biar chaotic
        lfoR.start(0);

        const gainR = ctx.createGain();
        gainR.gain.value = -0.003; // Inverted phaseish

        lfoR.connect(gainR);
        gainR.connect(delayR.delayTime);

        const panR = ctx.createStereoPanner();
        panR.pan.value = 1; // Full Right

        const insectFilter = ctx.createBiquadFilter();
        insectFilter.type = "highpass";
        insectFilter.frequency.value = 1500;

        source.connect(insectFilter);

        insectFilter.connect(delayL);
        delayL.connect(panL);
        panL.connect(destination);

        insectFilter.connect(delayR);
        delayR.connect(panR);
        panR.connect(destination);
    });
}
