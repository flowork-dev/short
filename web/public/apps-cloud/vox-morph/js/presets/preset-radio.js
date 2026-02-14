//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-radio.js total lines 49 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('radio', 'Old Radio', (ctx, source, destination) => {

        const hpf = ctx.createBiquadFilter();
        hpf.type = "highpass";
        hpf.frequency.value = 600;

        const lpf = ctx.createBiquadFilter();
        lpf.type = "lowpass";
        lpf.frequency.value = 3000;
        lpf.Q.value = 2; // Sedikit resonansi biar cempreng

        const shaper = ctx.createWaveShaper();
        function makeDistortionCurve(amount) {
            let k = typeof amount === 'number' ? amount : 50,
                n_samples = 44100,
                curve = new Float32Array(n_samples),
                deg = Math.PI / 180,
                i = 0, x;
            for ( ; i < n_samples; ++i ) {
                x = i * 2 / n_samples - 1;
                curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
            }
            return curve;
        };
        shaper.curve = makeDistortionCurve(40); // Moderate dist

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -24;
        comp.knee.value = 30;
        comp.ratio.value = 10;

        const gain = ctx.createGain();
        gain.gain.value = 1.2;

        source.connect(hpf);
        hpf.connect(lpf);
        lpf.connect(shaper);
        shaper.connect(comp);
        comp.connect(gain);
        gain.connect(destination);
    });
}
