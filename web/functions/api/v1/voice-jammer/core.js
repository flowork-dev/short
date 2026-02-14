//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\voice-jammer\core.js total lines 281 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

const { createApp, ref, onMounted, onBeforeUnmount } = Vue;

window.initVoiceJammer = function() {

    if(!document.getElementById('app-mount-point')) return;
    if(document.getElementById('app-mount-point').hasAttribute('data-v-app')) return;

    createApp({
    setup() {
        const fileName = ref('');
        const intensity = ref(50);
        const isProcessing = ref(false);
        const resultUrl = ref(null);
        const fileInput = ref(null);

        let audioContext = null;
        let originalBuffer = null;

        const setupVisualizer = (buffer) => {
            const canvas = document.getElementById('visualizer');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const data = buffer.getChannelData(0);
            const step = Math.ceil(data.length / canvas.width);
            const amp = canvas.height / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#54d7f6';
            ctx.beginPath();

            for(let i = 0; i < canvas.width; i++){
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
            }
        };

        const triggerUpload = () => {
            if(fileInput.value) {
                fileInput.value.click();
            } else {
                const manualInput = document.getElementById('hidden-file-input');
                if(manualInput) manualInput.click();
                else console.error("Input file not found!");
            }
        };

        const handleFile = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            fileName.value = file.name;
            resultUrl.value = null;

            const arrayBuffer = await file.arrayBuffer();
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

            setTimeout(() => setupVisualizer(originalBuffer), 50);
        };

        const loadSampleAudio = async () => {
            isProcessing.value = true;
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();

                const duration = 5;
                const sampleRate = audioContext.sampleRate;
                const frameCount = sampleRate * duration;
                const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
                const data = buffer.getChannelData(0);

                for (let i = 0; i < frameCount; i++) {
                    const t = i / sampleRate;
                    data[i] = (Math.sin(2 * Math.PI * 440 * t) * 0.5) +
                              (Math.sin(2 * Math.PI * 880 * t) * 0.25) +
                              (Math.sin(2 * Math.PI * (2 + Math.sin(t*5)*5) * t) * 0.2);
                }

                originalBuffer = buffer;
                fileName.value = "AI_VOICE_SAMPLE.wav";
                setTimeout(() => setupVisualizer(buffer), 50);

            } catch (e) {
                console.error(e);
                alert("Gagal load sample.");
            } finally {
                isProcessing.value = false;
            }
        };

        const resetApp = () => {
            fileName.value = '';
            resultUrl.value = null;
            originalBuffer = null;
            if (fileInput.value) fileInput.value.value = '';
        };

        const processAudio = async () => {
            if (!originalBuffer || !audioContext) return;
            isProcessing.value = true;

            setTimeout(async () => {
                try {
                    const estimatedLength = Math.ceil(originalBuffer.length * 1.1);

                    const offlineCtx = new OfflineAudioContext(
                        originalBuffer.numberOfChannels,
                        estimatedLength,
                        originalBuffer.sampleRate
                    );


                    const shiftFactor = 1.0 + ((intensity.value / 100) * 0.12);
                    const randomDrift = (Math.random() * 0.03) - 0.015;
                    const finalRate = shiftFactor + randomDrift;

                    const source = offlineCtx.createBufferSource();
                    source.buffer = originalBuffer;
                    source.playbackRate.value = finalRate;

                    /*
                    const filter = offlineCtx.createBiquadFilter();
                    filter.type = "notch"; // "Bolongin" frekuensi
                    filter.Q.value = 5; // Lebar lubangnya

                    const duration = originalBuffer.duration / finalRate;
                    filter.frequency.setValueAtTime(500, 0);
                    filter.frequency.linearRampToValueAtTime(3000, duration / 2);
                    filter.frequency.linearRampToValueAtTime(500, duration);
                    */


                    const carrierGain = offlineCtx.createGain();
                    const modulatorOsc = offlineCtx.createOscillator();
                    const modulatorGain = offlineCtx.createGain();

                    const modFreq = 20 + ((intensity.value / 100) * 50); // 20Hz - 70Hz
                    modulatorOsc.frequency.value = modFreq;

                    const modDepth = (intensity.value / 100) * 0.6; // Max 60% modulation


                    carrierGain.gain.value = 1.0 - (modDepth / 2); // Base gain
                    modulatorGain.gain.value = modDepth;

                    source.connect(carrierGain);
                    modulatorOsc.connect(modulatorGain);
                    modulatorGain.connect(carrierGain.gain);


                    const splitter = offlineCtx.createChannelSplitter(2);
                    const merger = offlineCtx.createChannelMerger(2);

                    const delayNode = offlineCtx.createDelay();
                    delayNode.delayTime.value = (intensity.value / 100) * 0.05;

                    carrierGain.connect(splitter);

                    splitter.connect(merger, 0, 0);

                    splitter.connect(delayNode, 1, 0); // Ambil input 1 (kanan)
                    delayNode.connect(merger, 0, 1);   // Masuk ke output 1 (kanan)

                    const masterGain = offlineCtx.createGain();
                    masterGain.gain.value = 0.9;

                    merger.connect(masterGain);
                    masterGain.connect(offlineCtx.destination);


                    const noiseBuffer = offlineCtx.createBuffer(
                        originalBuffer.numberOfChannels,
                        estimatedLength,
                        originalBuffer.sampleRate
                    );

                    const noiseVol = (intensity.value / 100) * 0.15; // Max 15% volume noise (jangan kenceng2 ntar lagunya rusak)

                    let lastOut = 0; // Move declaration outside loop

                    for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
                        const data = noiseBuffer.getChannelData(ch);
                        for (let i = 0; i < estimatedLength; i++) {
                            const white = Math.random() * 2 - 1;
                            data[i] = (lastOut + (0.02 * white)) / 1.02;
                            lastOut = data[i];
                            data[i] *= 3.5 * noiseVol;
                        }
                    }

                    const noiseSource = offlineCtx.createBufferSource();
                    noiseSource.buffer = noiseBuffer;
                    noiseSource.connect(offlineCtx.destination);

                    source.start();
                    modulatorOsc.start(); // Start modulator
                    noiseSource.start();

                    const renderedBuffer = await offlineCtx.startRendering();

                    const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
                    resultUrl.value = URL.createObjectURL(wavBlob);

                } catch (e) {
                    console.error("Jamming error:", e);
                    alert("Processing failed. Audio format might be unsupported.");
                } finally {
                    isProcessing.value = false;
                }
            }, 500);
        };

        function bufferToWave(abuffer, len) {
            let numOfChan = abuffer.numberOfChannels,
                length = len * numOfChan * 2 + 44,
                buffer = new ArrayBuffer(length),
                view = new DataView(buffer),
                channels = [], i, sample, offset = 0, pos = 0;

            setUint32(0x46464952);                         // "RIFF"
            setUint32(length - 8);                         // file length - 8
            setUint32(0x45564157);                         // "WAVE"

            setUint32(0x20746d66);                         // "fmt " chunk
            setUint32(16);                                 // length = 16
            setUint16(1);                                  // PCM (uncompressed)
            setUint16(numOfChan);
            setUint32(abuffer.sampleRate);
            setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
            setUint16(numOfChan * 2);                      // block-align
            setUint16(16);                                 // 16-bit (hardcoded in this demo)

            setUint32(0x61746164);                         // "data" - chunk
            setUint32(length - pos - 4);                   // chunk length

            for(i = 0; i < abuffer.numberOfChannels; i++)
                channels.push(abuffer.getChannelData(i));

            while(pos < len) {
                for(i = 0; i < numOfChan; i++) {             // interleave channels
                    sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
                    sample = (sample < 0 ? sample * 32768 : sample * 32767)|0;
                    view.setInt16(44 + offset, sample, true);
                    offset += 2;
                }
                pos++;
            }

            return new Blob([buffer], {type: "audio/wav"});

            function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
            function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }
        }

        return {
            fileName,
            intensity,
            isProcessing,
            resultUrl,
            fileInput,
            handleFile,
            triggerUpload,
            processAudio,
            loadSampleAudio,
            resetApp
        };
    }
    }).mount('#app-mount-point');
}
