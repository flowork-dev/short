//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\presets\preset-cave.js total lines 39 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

if (window.AudioCore) {
    window.AudioCore.registerPreset('cave', 'Cave Echo', (ctx, source, destination) => {

        const delay = ctx.createDelay();
        delay.delayTime.value = 0.4; // 400ms Delay

        const feedback = ctx.createGain();
        feedback.gain.value = 0.5; // Increased feedback for more echo

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1500; // Darker echo (dampen high freq)

        const dryGain = ctx.createGain();
        dryGain.gain.value = 0.8; // Original sound volume

        const wetGain = ctx.createGain();
        wetGain.gain.value = 0.6; // Echo sound volume


        source.connect(dryGain);
        dryGain.connect(destination);

        source.connect(filter); // Filter first
        filter.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay); // Loop closed here

        delay.connect(wetGain);
        wetGain.connect(destination);

    });
}
