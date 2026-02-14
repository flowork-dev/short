//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-demon.js total lines 44 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('demon', 'Demon Lord', (ctx, source, destination) => {

        const preGain = ctx.createGain();
        preGain.gain.value = 1.0;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 600;
        lowpass.Q.value = 1;

        const delay = ctx.createDelay();
        delay.delayTime.value = 0.08; // 80ms

        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        const deg = Math.PI / 180;
        for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = (3 + 10) * x * 20 * deg / (Math.PI + 10 * Math.abs(x));
        }
        shaper.curve = curve;

        const masterWet = ctx.createGain();
        masterWet.gain.value = 1.5; // Boost volume karena lowpass bikin pelan

        source.connect(preGain);
        preGain.connect(shaper); // Add grit first
        shaper.connect(lowpass); // Then darken it

        lowpass.connect(masterWet);

        lowpass.connect(delay);
        delay.connect(masterWet);

        masterWet.connect(destination);
    });
}
