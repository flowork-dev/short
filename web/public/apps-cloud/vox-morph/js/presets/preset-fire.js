//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-fire.js total lines 56 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('fire_mage', 'Fire Mage', (ctx, source, destination) => {

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
        shaper.curve = makeDistortionCurve(100);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2000; // Muffled burning sound

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.15; // Crackle volume

        let noiseNode = null;
        if(window.AudioCore.noiseBuffer) {
            noiseNode = ctx.createBufferSource();
            noiseNode.buffer = window.AudioCore.noiseBuffer;
            noiseNode.loop = true;
            noiseNode.start(0);

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "bandpass";
            noiseFilter.frequency.value = 800;
            noiseFilter.Q.value = 1;

            noiseNode.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
        }

        source.connect(shaper);
        shaper.connect(filter);
        filter.connect(destination);

        if(noiseNode) {
            noiseGain.connect(destination);
        }
    });
}
