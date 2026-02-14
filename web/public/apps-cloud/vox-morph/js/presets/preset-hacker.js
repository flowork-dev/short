//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-hacker.js total lines 79 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('hacker', 'Anonymous V2', (ctx, source, destination) => {

        const preGain = ctx.createGain();
        preGain.gain.value = 1.8; // Paksa input biar pecah dikit

        const bitCrusher = ctx.createWaveShaper();
        bitCrusher.oversample = 'none'; // Biar kasar
        const bufferSize = 4096;
        const curve = new Float32Array(bufferSize);
        const steps = 8; // Resolusi rendah (makin kecil makin hancur)
        for (let i = 0; i < bufferSize; i++) {
            const x = (i * 2) / bufferSize - 1;
            curve[i] = Math.round(x * steps) / steps;
        }
        bitCrusher.curve = curve;

        const lpf = ctx.createBiquadFilter();
        lpf.type = "lowpass";
        lpf.frequency.value = 550; // Gelap banget
        lpf.Q.value = 1;

        const tremoloGain = ctx.createGain();
        tremoloGain.gain.value = 0; // Base gain (nanti dimodulasi)

        const lfo = ctx.createOscillator();
        lfo.type = 'square'; // Kotak biar patah-patah
        lfo.frequency.value = 50; // 50Hz vibration
        lfo.start(0);

        const lfoDepth = ctx.createGain();
        lfoDepth.gain.value = 1;
        lfo.connect(lfoDepth);


        const pathBody = ctx.createBiquadFilter();
        pathBody.type = "lowpass";
        pathBody.frequency.value = 400;

        const distBody = ctx.createWaveShaper();
        const distCurve = new Float32Array(44100);
        for(let i=0; i<44100; i++) {
            const x = i*2/44100 - 1;
            distCurve[i] = (3 + 20) * x * 20 * (Math.PI/180) / (Math.PI + 20 * Math.abs(x));
        }
        distBody.curve = distCurve;

        const pathGlitch = bitCrusher; // Reuse node diatas

        const mixer = ctx.createGain();
        mixer.gain.value = 1.0;

        source.connect(preGain);

        preGain.connect(pathBody);
        pathBody.connect(distBody);
        distBody.connect(mixer);

        preGain.connect(lpf);
        lpf.connect(pathGlitch);
        const glitchGate = ctx.createGain();
        pathGlitch.connect(glitchGate);
        lfo.connect(glitchGate.gain); // Square wave modulation
        glitchGate.connect(mixer);

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.ratio.value = 10;

        mixer.connect(compressor);
        compressor.connect(destination);
    });
}
