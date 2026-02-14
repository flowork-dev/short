//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-vhs.js total lines 46 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('vhs_ghost', 'VHS Ghost', (ctx, source, destination) => {

        const delay = ctx.createDelay();
        delay.delayTime.value = 0.05; // Base delay

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2; // 2Hz wobble
        lfo.start(0);

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.002; // Depth of wobble

        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);

        const hpf = ctx.createBiquadFilter();
        hpf.type = "highpass";
        hpf.frequency.value = 200;

        const lpf = ctx.createBiquadFilter();
        lpf.type = "lowpass";
        lpf.frequency.value = 2000; // Very dark

        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = Math.tanh(x * 2);
        }
        shaper.curve = curve;

        source.connect(delay);
        delay.connect(hpf);
        hpf.connect(lpf);
        lpf.connect(shaper);
        shaper.connect(destination);
    });
}
