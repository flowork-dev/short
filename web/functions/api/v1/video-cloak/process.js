//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\video-cloak\process.js total lines 206 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

window.initCloakApp = function() {
    const { createApp, ref, nextTick } = Vue;

    return createApp({
        setup() {
            const videoSrc = ref(null);
            const fileName = ref('');
            const outputName = ref('');
            const isProcessing = ref(false);
            const downloadUrl = ref(null);
            const statusText = ref('SYSTEM READY');

            const fileInput = ref(null);
            const videoRef = ref(null);
            const canvasRef = ref(null);

            let mediaRecorder = null;
            let recordedChunks = [];
            let audioCtx = null;
            let animationId = null;

            const strategy = {
                audio_freq: 19500,        // Ultrasonic (High)
                audio_wave: 'sawtooth',   // Bentuk gelombang kasar
                eq_shift_amount: 3,       // dB boost untuk EQ

                zoom_intensity: 0.02,     // 2% Breathing Zoom (Geometri)
                noise_opacity: 0.04,      // Noise level
                color_shift_speed: 0.005, // Kecepatan perubahan warna

                speed_multiplier: 1.02    // 102% Speed (Time warp halus)
            };

            const triggerUpload = () => fileInput.value.click();

            const handleFile = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if(videoSrc.value) URL.revokeObjectURL(videoSrc.value);
                if(downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);

                fileName.value = file.name;
                videoSrc.value = URL.createObjectURL(file);
                downloadUrl.value = null;
                statusText.value = "ASSET LOADED";

                nextTick(() => {
                    const vid = videoRef.value;
                    const cvs = canvasRef.value;
                    vid.src = videoSrc.value;
                    vid.onloadedmetadata = () => {
                        cvs.width = vid.videoWidth;
                        cvs.height = vid.videoHeight;
                        const ctx = cvs.getContext('2d');
                        ctx.drawImage(vid, 0, 0);
                    };
                });
            };

            const startProcess = async () => {
                if (!videoSrc.value) return;
                isProcessing.value = true;

                const vid = videoRef.value;
                const cvs = canvasRef.value;
                const ctx = cvs.getContext('2d');

                statusText.value = "ENGAGING: AUDIO SPECTRAL MASK...";
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const dest = audioCtx.createMediaStreamDestination();

                const source = audioCtx.createMediaElementSource(vid);

                const eqFilter = audioCtx.createBiquadFilter();
                eqFilter.type = "peaking";
                eqFilter.frequency.value = 400; // Fokus di body suara manusia
                eqFilter.Q.value = 1;
                eqFilter.gain.value = strategy.eq_shift_amount;

                const osc = audioCtx.createOscillator();
                const oscGain = audioCtx.createGain();
                osc.type = strategy.audio_wave;
                osc.frequency.value = strategy.audio_freq;
                oscGain.gain.value = 0.03; // Kecil aja, mic AI sensitif banget

                source.connect(eqFilter);
                eqFilter.connect(dest);

                osc.connect(oscGain);
                oscGain.connect(dest);
                osc.start();

                const canvasStream = cvs.captureStream(30);
                const finalStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...dest.stream.getAudioTracks()
                ]);

                let mimeType = 'video/webm';
                if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';
                else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) mimeType = 'video/webm; codecs=vp9';

                mediaRecorder = new MediaRecorder(finalStream, {
                    mimeType,
                    videoBitsPerSecond: 8000000 // 8Mbps (Kualitas Tinggi)
                });

                recordedChunks = [];
                mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: mimeType });
                    downloadUrl.value = URL.createObjectURL(blob);

                    const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
                    const randomCode = Math.random().toString(36).substring(2,8).toUpperCase();
                    outputName.value = `SECURE_${randomCode}_${fileName.value.replace(/\.[^/.]+$/, "")}${ext}`;

                    isProcessing.value = false;
                    statusText.value = "CLOAKING COMPLETE";
                    audioCtx.close();
                    cancelAnimationFrame(animationId);

                    vid.playbackRate = 1.0;
                };

                statusText.value = "INJECTING: GEOMETRIC & VISUAL NOISE...";

                vid.playbackRate = strategy.speed_multiplier;

                await vid.play();
                mediaRecorder.start();

                let frameCount = 0;

                const drawFrame = () => {
                    if (vid.paused || vid.ended) {
                        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
                        return;
                    }

                    const w = cvs.width;
                    const h = cvs.height;

                    ctx.clearRect(0, 0, w, h);

                    frameCount++;
                    const zoomPhase = Math.sin(frameCount * 0.05); // Kecepatan napas
                    const scale = 1.01 + (zoomPhase * strategy.zoom_intensity); // Range 1.01 - 1.03

                    const dw = w * scale;
                    const dh = h * scale;
                    const dx = (w - dw) / 2;
                    const dy = (h - dh) / 2;

                    ctx.drawImage(vid, dx, dy, dw, dh);

                    ctx.globalCompositeOperation = 'overlay';
                    ctx.globalAlpha = strategy.noise_opacity;

                    const r = 128 + Math.sin(frameCount * 0.02) * 50;
                    const b = 128 + Math.cos(frameCount * 0.03) * 50;
                    ctx.fillStyle = `rgb(${r}, 0, ${b})`;
                    ctx.fillRect(0, 0, w, h);

                    ctx.globalCompositeOperation = 'source-over'; // Balik normal
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    const lineY = Math.random() * h;
                    ctx.fillRect(0, lineY, w, 2);

                    if (frameCount % 30 === 0) {
                        eqFilter.frequency.value = 400 + (Math.random() * 100 - 50);
                    }

                    animationId = requestAnimationFrame(drawFrame);
                };

                drawFrame();
            };

            const resetState = () => {
                videoSrc.value = null;
                downloadUrl.value = null;
                isProcessing.value = false;
                recordedChunks = [];
                statusText.value = "READY TO CLOAK";
            };

            const finishRecording = () => {
                if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
            };

            return {
                videoSrc, fileName, outputName, isProcessing, downloadUrl, statusText,
                fileInput, videoRef, canvasRef,
                triggerUpload, handleFile, startProcess, resetState, finishRecording
            };
        }
    }).mount('#cloak-app-mount');
}
