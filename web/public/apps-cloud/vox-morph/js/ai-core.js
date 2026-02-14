//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\ai-core.js total lines 63 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

window.FloworkAI = {
    model: null,
    isProcessing: false,

    async init() {
        if (this.model) return true;

        if(window.SysUI) window.SysUI.toast("DOWNLOADING AI MODEL (±30MB)...", "info");

        try {
            this.model = await window.AI_PIPELINE('audio-to-audio', 'xenova/speech-enhancement-base');

            if(window.SysUI) window.SysUI.toast("NEURAL MODEL LOADED", "success");
            return true;
        } catch (e) {
            console.error("AI INIT ERROR:", e);
            if(window.SysUI) window.SysUI.toast("AI LOAD FAILED: " + e.message, "error");
            return false;
        }
    },

    async processAudioBuffer(audioBuffer) {
        if (this.isProcessing) return null;
        this.isProcessing = true;

        if (!await this.init()) {
            this.isProcessing = false;
            return null;
        }

        try {
            if(window.SysUI) window.SysUI.toast("AI PROCESSING STARTED... (HOLD ON)", "info");

            const inputData = audioBuffer.getChannelData(0);

            const out = await this.model(inputData, {
                sampling_rate: audioBuffer.sampleRate
            });

            const cleanData = out.audio;
            const newSampleRate = 16000;

            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const newBuffer = ctx.createBuffer(1, cleanData.length, newSampleRate);
            newBuffer.getChannelData(0).set(cleanData);

            this.isProcessing = false;
            return newBuffer;

        } catch (e) {
            console.error("AI PROCESS ERROR:", e);
            if(window.SysUI) window.SysUI.toast("AI ERROR: " + e.message, "error");
            this.isProcessing = false;
            return null;
        }
    }
};
