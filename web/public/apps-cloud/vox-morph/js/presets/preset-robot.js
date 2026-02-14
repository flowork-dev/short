//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-robot.js total lines 51 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('robot', 'Cyber Droid', (ctx, source, destination) => {

        const bpf = ctx.createBiquadFilter();
        bpf.type = 'bandpass';
        bpf.frequency.value = 800;
        bpf.Q.value = 1.5;

        const oscillator = ctx.createOscillator();
        oscillator.type = 'sawtooth'; // Lebih kasar dari sine
        oscillator.frequency.value = 50; // 50Hz metallic effect
        oscillator.start(0);

        const modNode = ctx.createGain();
        modNode.gain.value = 0; // PENTING: Base value 0, digerakkan sepenuhnya oleh Osc

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
        shaper.curve = makeDistortionCurve(200); // Hard distortion
        shaper.oversample = '4x';

        const outGain = ctx.createGain();
        outGain.gain.value = 1.5; // Makeup gain

        source.connect(bpf);

        bpf.connect(modNode);
        oscillator.connect(modNode.gain);

        modNode.connect(shaper);
        shaper.connect(outGain);
        outGain.connect(destination);
    });
}
