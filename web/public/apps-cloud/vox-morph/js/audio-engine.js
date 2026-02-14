//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\vox-morph\js\audio-engine.js total lines 341 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

const SysUI = {
    init() {
        if (!document.getElementById('sys-ui-layer')) {
            const div = document.createElement('div');
            div.id = 'sys-ui-layer';
            div.className = 'fixed inset-0 z-[100] pointer-events-none flex flex-col items-end justify-end p-6 gap-4 font-hud';
            document.body.appendChild(div);
        }
    },
    toast(msg, type = 'info') {
        const layer = document.getElementById('sys-ui-layer');
        if(!layer) return;
        const el = document.createElement('div');
        const color = type === 'error' ? 'border-red-500 text-red-400 bg-red-900/90' : (type === 'success' ? 'border-green-500 text-green-400 bg-green-900/90' : 'border-[#54d7f6] text-[#54d7f6] bg-[#171925]/90');
        el.className = `pointer-events-auto px-6 py-3 rounded border-l-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md transform transition-all duration-300 translate-x-full opacity-0 ${color} mb-2 min-w-[200px]`;
        el.innerHTML = `<div class="font-bold text-[10px] tracking-widest mb-1 uppercase">SYSTEM_${type.toUpperCase()}</div><div class="text-xs font-mono">${msg}</div>`;
        layer.appendChild(el);
        requestAnimationFrame(() => { el.classList.remove('translate-x-full', 'opacity-0'); });
        setTimeout(() => { el.classList.add('translate-x-full', 'opacity-0'); setTimeout(() => el.remove(), 300); }, 3000);
    },
    createModalBase(contentHTML) {
        const overlay = document.createElement('div');
        overlay.id = 'sys-modal-overlay';
        overlay.className = 'fixed inset-0 z-[110] bg-[#000]/80 backdrop-blur-sm flex items-center justify-center animate-enter';
        overlay.innerHTML = `<div class="bg-[#171925] border border-[#3a3962] w-[90%] max-w-md p-1 rounded relative shadow-[0_0_50px_rgba(112,107,243,0.2)]"><div class="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#54d7f6]"></div><div class="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#54d7f6]"></div><div class="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#54d7f6]"></div><div class="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#54d7f6]"></div><div class="bg-[#1e2030] p-6 rounded-sm">${contentHTML}</div></div>`;
        document.body.appendChild(overlay);
        return overlay;
    },
    prompt(title, callback) {
        const old = document.getElementById('sys-modal-overlay'); if(old) old.remove();
        const html = `<h3 class="text-[#54d7f6] font-bold text-lg mb-1 font-hud tracking-widest">${title}</h3><p class="text-gray-400 text-xs mb-4 font-mono">ENTER PARAMETER VALUE:</p><input type="text" id="sys-prompt-input" class="w-full bg-[#171925] border border-[#3a3962] text-white p-2 text-sm focus:border-[#54d7f6] outline-none font-mono mb-6 placeholder-gray-600" placeholder="Type here..." autocomplete="off"><div class="flex gap-2"><button id="sys-btn-cancel" class="flex-1 py-2 border border-[#3a3962] text-gray-400 hover:text-white text-xs font-bold rounded">CANCEL</button><button id="sys-btn-confirm" class="flex-1 py-2 bg-[#706bf3] text-white text-xs font-bold rounded hover:bg-[#5e59d0]">CONFIRM</button></div>`;
        const overlay = this.createModalBase(html);
        const input = document.getElementById('sys-prompt-input'); input.focus();
        const close = () => { overlay.classList.add('opacity-0'); setTimeout(() => overlay.remove(), 200); };
        document.getElementById('sys-btn-cancel').onclick = close;
        const confirmAction = () => { const val = input.value.trim(); if(val) callback(val); close(); };
        document.getElementById('sys-btn-confirm').onclick = confirmAction;
        input.onkeydown = (e) => { if(e.key === 'Enter') confirmAction(); else if(e.key === 'Escape') close(); };
    },
    confirm(title, msg, onConfirm) {
        const old = document.getElementById('sys-modal-overlay'); if(old) old.remove();
        const html = `<h3 class="text-red-500 font-bold text-lg mb-2 font-hud tracking-widest flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4"></i> ${title}</h3><p class="text-gray-300 text-sm mb-6 leading-relaxed border-l-2 border-red-900 pl-3">${msg}</p><div class="flex gap-2"><button id="sys-btn-cancel" class="flex-1 py-2 border border-[#3a3962] text-gray-400 hover:text-white text-xs font-bold rounded">CANCEL</button><button id="sys-btn-confirm" class="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">EXECUTE</button></div>`;
        const overlay = this.createModalBase(html);
        lucide.createIcons();
        const close = () => { overlay.classList.add('opacity-0'); setTimeout(() => overlay.remove(), 200); };
        document.getElementById('sys-btn-cancel').onclick = close;
        document.getElementById('sys-btn-confirm').onclick = () => { onConfirm(); close(); };
    }
};

window.AudioCore = {
    audioContext: null, sourceBuffer: null, activeSource: null, fileName: "recording",
    isPlaying: false, isToggling: false, mediaRecorder: null, micChunks: [], isRecording: false,
    analyser: null, canvasCtx: null,

    spectroCanvas: null, spectroCtx: null, // Untuk Spectrogram
    isAutoMod: false, stegoMessage: "", // Untuk AutoMod & Steganography

    presetRegistry: {}, activePresetId: 'normal', activePluginConnections: null,
    nodes: { denoiseGate: null, pitchDelay: null, pitchLfo: null, pitchGain: null, formantFilter: null, tunerShaper: null, tunerGain: null, glitchDelay: null, glitchLfo: null, glitchGain: null, hiveDelayL: null, hiveDelayR: null, hiveLfo: null, hiveGain: null, hivePanL: null, hivePanR: null, auraSource: null, auraFilter: null, auraGain: null, warpDelay: null, warpLfo: null, warpGain: null, presetIn: null, presetOut: null, osc: null, modGain: null, dryMod: null, modLFO: null, modDelay: null, modDepth: null, lpf: null, hpf: null, dist: null, crush: null, panner: null, pannerLfo: null, pannerDepth: null, reverbGain: null, delay: null, delayGain: null, master: null },
    noiseBuffer: null,

    registerPreset(id, name, builder) { console.log(`[SYSTEM] Plugin: ${name}`); this.presetRegistry[id] = { name, build: builder }; },

    initCtx() {
        if(!this.audioContext) {
            SysUI.init();
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initVisualizer();
            this.setupParamsListener();
            this.createNoiseBuffer();
            this.loadLastSession();
            this.startAutoModLoop(); // Start LFO System
        }
    },

    resetSystem() {
        if (this.isPlaying) this.togglePreview();
        this.applyPreset('normal');
        this.injectCustomGraph(null, this.audioContext);
        this.activePresetId = 'normal';
        this.isAutoMod = false; // Stop auto modulation
        document.querySelectorAll('button[onclick*="applyPreset"]').forEach(b => { b.classList.remove('border-[#54d7f6]', 'text-[#54d7f6]'); });
        if (this.sourceBuffer) { SysUI.toast("SYSTEM RESET // AUDIO RETAINED", "success"); } else { SysUI.toast("SYSTEM RESET COMPLETE", "info"); }
    },

    initVisualizer() {
        const canvas = document.getElementById('visualizer');
        if (!canvas) return;
        this.canvasCtx = canvas.getContext('2d');
        this.spectroCanvas = document.createElement('canvas');
        this.spectroCtx = this.spectroCanvas.getContext('2d');
        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            this.spectroCanvas.width = canvas.width;
            this.spectroCanvas.height = canvas.height;
        };
        window.addEventListener('resize', resize);
        resize();
        this.drawVisualizer();
    },

    drawVisualizer() {
        if (!this.canvasCtx) return;
        requestAnimationFrame(() => this.drawVisualizer());
        const width = this.canvasCtx.canvas.width;
        const height = this.canvasCtx.canvas.height;

        if (!this.analyser || !this.isPlaying) {
            this.canvasCtx.fillStyle = '#171925'; this.canvasCtx.fillRect(0,0,width,height);
            this.canvasCtx.beginPath(); this.canvasCtx.moveTo(0, height/2); this.canvasCtx.lineTo(width, height/2);
            this.canvasCtx.strokeStyle = '#3a3962'; this.canvasCtx.stroke();
            return;
        }

        const bufferLen = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLen);
        this.analyser.getByteFrequencyData(dataArray);

        this.spectroCtx.drawImage(this.canvasCtx.canvas, -2, 0);

        const barHeight = height / bufferLen;
        for(let i = 0; i < bufferLen; i++) {
            const val = dataArray[i];
            const y = height - (i * (height / bufferLen));
            let r=0, g=0, b=0;
            if(val > 0) { g = val; b = val + 50; r = val > 200 ? val : 0; }
            this.spectroCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.spectroCtx.fillRect(width - 2, y, 2, height/bufferLen + 1);
        }

        if (this.stegoMessage) {
            this.spectroCtx.save();
            this.spectroCtx.fillStyle = '#ffffff';
            this.spectroCtx.font = '10px monospace';
            this.spectroCtx.fillText(this.stegoMessage, width - 30, height / 2); // Print text in graph
            this.spectroCtx.restore();
            this.stegoMessage = ""; // Clear flag
        }

        this.canvasCtx.drawImage(this.spectroCanvas, 0, 0);

        this.canvasCtx.strokeStyle = 'rgba(84, 215, 246, 0.1)';
        this.canvasCtx.lineWidth = 1;
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(0, height/2); this.canvasCtx.lineTo(width, height/2);
        this.canvasCtx.stroke();
    },

    triggerTextSignal(text) {
        this.initCtx();
        if(!text) return;
        if(this.audioContext.state === 'suspended') this.audioContext.resume();

        this.stegoMessage = text.toUpperCase(); // Trigger visual message

        const ctx = this.audioContext;
        const dest = this.nodes.presetIn || ctx.destination;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator(); osc.type = 'square'; osc.frequency.setValueAtTime(440, now);
        const gain = ctx.createGain(); gain.gain.setValueAtTime(0, now);

        let time = now;
        for (let i = 0; i < text.length; i++) {
            const bits = text.charCodeAt(i).toString(2); // Char to binary
            for (let j = 0; j < bits.length; j++) {
                const bit = bits[j];
                const duration = 0.05;
                if (bit === '1') {
                    osc.frequency.setValueAtTime(880, time);
                    gain.gain.setValueAtTime(0.1, time); gain.gain.setValueAtTime(0, time + duration - 0.01);
                } else {
                    osc.frequency.setValueAtTime(220, time);
                    gain.gain.setValueAtTime(0.1, time); gain.gain.setValueAtTime(0, time + duration - 0.01);
                }
                time += duration;
            }
            time += 0.1;
        }
        osc.connect(gain).connect(dest);
        osc.start(now); osc.stop(time + 0.5);
        SysUI.toast(`TRANSMITTING: ${text}`, "success");
    },

    triggerSFX(type) {
        this.initCtx();
        if(this.audioContext.state === 'suspended') this.audioContext.resume();
        const ctx = this.audioContext;
        const dest = this.nodes.presetIn || ctx.destination;
        const t = ctx.currentTime;

        if (type === 'glitch') {
            const osc = ctx.createOscillator(); osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t); osc.frequency.exponentialRampToValueAtTime(10, t + 0.2);
            const gain = ctx.createGain(); gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            const dist = ctx.createWaveShaper(); dist.curve = this.makeDistortionCurve(400);
            osc.connect(dist).connect(gain).connect(dest); osc.start(t); osc.stop(t + 0.2);
            SysUI.toast("SFX: DATA_BURST", "info");
        } else if (type === 'siren') {
            const osc = ctx.createOscillator(); osc.type = 'square';
            osc.frequency.setValueAtTime(800, t); osc.frequency.linearRampToValueAtTime(1200, t + 0.3); osc.frequency.linearRampToValueAtTime(800, t + 0.6);
            const gain = ctx.createGain(); gain.gain.setValueAtTime(0.2, t); gain.gain.linearRampToValueAtTime(0, t + 0.6);
            osc.connect(gain).connect(dest); osc.start(t); osc.stop(t + 0.6);
            SysUI.toast("SFX: ALERT", "info");
        } else if (type === 'scan') {
            const osc = ctx.createOscillator(); osc.type = 'sine';
            osc.frequency.setValueAtTime(2000, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
            const gain = ctx.createGain(); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
            osc.connect(gain).connect(dest); osc.start(t); osc.stop(t + 0.5);
            SysUI.toast("SFX: SCAN", "info");
        }
    },

    toggleAutoMod() {
        this.isAutoMod = !this.isAutoMod;
        const btn = document.getElementById('btn-automod');
        if(btn) {
            if(this.isAutoMod) {
                btn.classList.remove('text-gray-500', 'border-gray-600');
                btn.classList.add('text-green-400', 'border-green-400', 'animate-pulse');
                SysUI.toast("LFO AUTOMATION: ENGAGED", "success");
            } else {
                btn.classList.add('text-gray-500', 'border-gray-600');
                btn.classList.remove('text-green-400', 'border-green-400', 'animate-pulse');
                SysUI.toast("LFO AUTOMATION: DISENGAGED", "info");
            }
        }
    },
    startAutoModLoop() {
        const loop = () => {
            if (this.isAutoMod && this.isPlaying) {
                const time = Date.now() / 1000;
                const pitchVal = Math.sin(time * 0.5) * 500;
                const elPitch = document.getElementById('param-pitch'); if(elPitch) elPitch.value = pitchVal;

                const panVal = Math.cos(time * 2) * 50;
                const elWidth = document.getElementById('param-width'); if(elWidth) elWidth.value = panVal;

                if (Math.random() > 0.95) {
                    const elGlitch = document.getElementById('param-glitch');
                    if(elGlitch) elGlitch.value = Math.random() * 50;
                } else {
                    const elGlitch = document.getElementById('param-glitch');
                    if(elGlitch) elGlitch.value = 0;
                }
                this.updateParams(); // Apply live
            }
            requestAnimationFrame(loop);
        };
        loop();
    },

    setupParamsListener() { },
    async toggleMic() { this.initCtx(); if (this.audioContext.state === 'suspended') await this.audioContext.resume(); const dot = document.getElementById('rec-dot'); const status = document.getElementById('filename-display'); if (this.isRecording) { if(this.mediaRecorder) this.mediaRecorder.stop(); this.isRecording = false; if(dot) { dot.classList.remove('animate-pulse', 'bg-red-500'); dot.classList.add('bg-gray-500'); } if(status) status.innerText = "PROCESSING..."; } else { try { if(this.isPlaying) this.togglePreview(); const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); this.mediaRecorder = new MediaRecorder(stream); this.micChunks = []; this.mediaRecorder.ondataavailable = (e) => this.micChunks.push(e.data); this.mediaRecorder.onstop = async () => { const blob = new Blob(this.micChunks, { type: 'audio/ogg; codecs=opus' }); const arrayBuffer = await blob.arrayBuffer(); this.sourceBuffer = await this.audioContext.decodeAudioData(arrayBuffer); stream.getTracks().forEach(track => track.stop()); if(status) status.innerText = "MIC_RECORDING.OGG"; setTimeout(() => this.togglePreview(), 500); }; this.mediaRecorder.start(); this.isRecording = true; if(dot) { dot.classList.remove('bg-gray-500'); dot.classList.add('bg-red-500', 'animate-pulse'); } if(status) status.innerText = "RECORDING..."; SysUI.toast("MICROPHONE ACTIVE", "info"); } catch (err) { SysUI.toast("MIC ERROR: " + err.message, "error"); } } },
    async togglePreview() { if (this.isToggling) return; this.isToggling = true; this.initCtx(); if (this.audioContext.state === 'suspended') await this.audioContext.resume(); if(this.isPlaying) { if(this.activeSource) { try { this.activeSource.stop(); } catch(e){} this.activeSource = null; } if(this.nodes.auraSource) try { this.nodes.auraSource.stop(); } catch(e){} this.isPlaying = false; this.updateUIState(false); } else { if(!this.sourceBuffer) { SysUI.toast("NO AUDIO DATA! Upload or Record first.", "error"); this.isToggling = false; return; } const src = this.audioContext.createBufferSource(); src.buffer = this.sourceBuffer; src.loop = true; await this.buildAudioGraph(this.audioContext, src); src.start(0); this.activeSource = src; this.isPlaying = true; this.updateUIState(true); } this.isToggling = false; lucide.createIcons(); },
    updateUIState(playing) { const btn = document.getElementById('btn-play'); const led = document.getElementById('engine-led'); const status = document.getElementById('engine-status'); if (playing) { if(btn) { btn.innerHTML = `<i data-lucide="square" class="w-3 h-3 fill-current"></i> <span>STOP SYSTEM</span>`; btn.classList.add('border-[#54d7f6]', 'text-[#54d7f6]'); btn.classList.remove('border-[#4a4972]', 'text-[#e0f0ff]'); } if(led) { led.classList.remove('bg-red-900'); led.classList.add('bg-green-500', 'animate-pulse'); } if(status) { status.innerText = "ONLINE"; status.classList.add('text-green-500'); } } else { if(btn) { btn.innerHTML = `<i data-lucide="play" class="w-3 h-3 fill-current group-hover:scale-110"></i> <span>RUN SYSTEM</span>`; btn.classList.remove('border-[#54d7f6]', 'text-[#54d7f6]'); btn.classList.add('border-[#4a4972]', 'text-[#e0f0ff]'); } if(led) { led.classList.remove('bg-green-500', 'animate-pulse'); led.classList.add('bg-red-900'); } if(status) { status.innerText = "OFFLINE"; status.classList.remove('text-green-500'); } } },
    async buildAudioGraph(ctx, source, isOffline=false) { const denoiseGate = ctx.createBiquadFilter(); denoiseGate.type = "highpass"; denoiseGate.frequency.value = 0; const pitchDelay = ctx.createDelay(); pitchDelay.delayTime.value = 0.05; const pitchLfo = ctx.createOscillator(); pitchLfo.type = 'sawtooth'; pitchLfo.frequency.value = 5; pitchLfo.start(0); const pitchGain = ctx.createGain(); pitchGain.gain.value = 0; pitchLfo.connect(pitchGain); pitchGain.connect(pitchDelay.delayTime); const formantFilter = ctx.createBiquadFilter(); formantFilter.type = "peaking"; formantFilter.Q.value = 1; const tunerGain = ctx.createGain(); const tunerShaper = ctx.createWaveShaper(); tunerShaper.curve = this.makeStepperCurve(100); tunerShaper.oversample = '4x'; const glitchDelay = ctx.createDelay(); glitchDelay.delayTime.value = 0.1; const glitchLfo = ctx.createOscillator(); glitchLfo.type = 'square'; glitchLfo.start(0); const glitchGain = ctx.createGain(); glitchGain.gain.value = 0; glitchLfo.connect(glitchGain); glitchGain.connect(glitchDelay.delayTime); const hiveDelayL = ctx.createDelay(); const hiveDelayR = ctx.createDelay(); const hiveLfo = ctx.createOscillator(); hiveLfo.type = 'sine'; hiveLfo.start(0); const hiveGain = ctx.createGain(); const hiveDepth = ctx.createGain(); hiveDepth.gain.value = 0.002; const hivePanL = ctx.createStereoPanner(); hivePanL.pan.value = -1; const hivePanR = ctx.createStereoPanner(); hivePanR.pan.value = 1; hiveLfo.connect(hiveDepth); hiveDepth.connect(hiveDelayL.delayTime); const inv = ctx.createGain(); inv.gain.value = -1; hiveDepth.connect(inv); inv.connect(hiveDelayR.delayTime); const auraSource = ctx.createBufferSource(); if(this.noiseBuffer){ auraSource.buffer = this.noiseBuffer; auraSource.loop = true; auraSource.start(0); } const auraFilter = ctx.createBiquadFilter(); auraFilter.type = "bandpass"; const auraGain = ctx.createGain(); const warpDelay = ctx.createDelay(); const warpLfo = ctx.createOscillator(); const warpGain = ctx.createGain(); warpLfo.type = 'sine'; warpLfo.start(0); warpLfo.connect(warpGain); warpGain.connect(warpDelay.delayTime); const presetIn = ctx.createGain(); const presetOut = ctx.createGain(); const osc = ctx.createOscillator(); osc.start(0); const ringGain = ctx.createGain(); const dryMod = ctx.createGain(); osc.connect(ringGain.gain); const modMix = ctx.createGain(); const modDelay = ctx.createDelay(); const modLFO = ctx.createOscillator(); modLFO.start(0); const modDepth = ctx.createGain(); modLFO.connect(modDepth); modDepth.connect(modDelay.delayTime); const lpf = ctx.createBiquadFilter(); lpf.type = "lowpass"; const hpf = ctx.createBiquadFilter(); hpf.type = "highpass"; const dist = ctx.createWaveShaper(); dist.oversample = '4x'; const crush = ctx.createWaveShaper(); const panner = ctx.createStereoPanner(); const pannerLfo = ctx.createOscillator(); pannerLfo.start(0); const pannerDepth = ctx.createGain(); pannerLfo.connect(pannerDepth); pannerDepth.connect(panner.pan); const delay = ctx.createDelay(); const dlFeedback = ctx.createGain(); dlFeedback.gain.value = 0.4; const dlMix = ctx.createGain(); const conv = ctx.createConvolver(); conv.buffer = this.impulseResponse(ctx, 2.0, 2); const revMix = ctx.createGain(); const master = ctx.createGain(); source.connect(denoiseGate); denoiseGate.connect(pitchDelay); pitchDelay.connect(formantFilter); const tDry = ctx.createGain(); formantFilter.connect(tDry); formantFilter.connect(tunerShaper); tunerShaper.connect(tunerGain); const tMerge = ctx.createGain(); tDry.connect(tMerge); tunerGain.connect(tMerge); tMerge.connect(glitchDelay); const hIn = glitchDelay; const hDry = ctx.createGain(); hIn.connect(hDry); hIn.connect(hiveDelayL); hiveDelayL.connect(hivePanL); hivePanL.connect(hiveGain); hIn.connect(hiveDelayR); hiveDelayR.connect(hivePanR); hivePanR.connect(hiveGain); const hMerge = ctx.createGain(); hDry.connect(hMerge); hiveGain.connect(hMerge); const aMerge = ctx.createGain(); hMerge.connect(aMerge); if(this.noiseBuffer) { auraSource.connect(auraFilter); auraFilter.connect(auraGain); auraGain.connect(aMerge); } aMerge.connect(warpDelay); warpDelay.connect(presetIn); presetIn.connect(presetOut); presetOut.connect(ringGain); presetOut.connect(dryMod); ringGain.connect(modMix); dryMod.connect(modMix); modMix.connect(modDelay); modDelay.connect(lpf); lpf.connect(hpf); hpf.connect(dist); dist.connect(crush); crush.connect(panner); panner.connect(delay); delay.connect(dlFeedback); dlFeedback.connect(delay); delay.connect(dlMix); panner.connect(conv); conv.connect(revMix); panner.connect(master); dlMix.connect(master); revMix.connect(master); if(!isOffline && this.canvasCtx) { this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 2048; master.connect(this.analyser); } master.connect(ctx.destination); const newNodes = { denoiseGate, pitchDelay, pitchLfo, pitchGain, formantFilter, tunerShaper, tunerGain, glitchDelay, glitchLfo, glitchGain, hiveDelayL, hiveDelayR, hiveLfo, hiveGain, hivePanL, hivePanR, auraSource, auraFilter, auraGain, warpDelay, warpLfo, warpGain, presetIn, presetOut, osc, modGain: ringGain, dryMod, modLFO, modDelay, modDepth, lpf, hpf, dist, crush, panner, pannerLfo, pannerDepth, delay, delayGain: dlMix, reverbGain: revMix, master }; const liveNodesBackup = this.nodes; this.nodes = newNodes; this.updateParams(ctx); if(this.activePresetId && this.presetRegistry[this.activePresetId]) { this.injectCustomGraph(this.activePresetId, ctx); } if (isOffline) { this.nodes = liveNodesBackup; } return master; },
    injectCustomGraph(presetId, ctx = this.audioContext) { const preset = this.presetRegistry[presetId]; const isOffline = (ctx !== this.audioContext); if (!isOffline) { try { this.nodes.presetIn.disconnect(); } catch(e){} if(this.activePluginConnections) { try { this.activePluginConnections.in.disconnect(); this.activePluginConnections.out.disconnect(); } catch(e){} this.activePluginConnections = null; } } else { try { this.nodes.presetIn.disconnect(); } catch(e){} } if (!preset) { this.nodes.presetIn.connect(this.nodes.presetOut); return; } if (!isOffline) console.log(`[FLOWORK] Wiring Hot-Swap: ${preset.name}`); const pIn = ctx.createGain(); const pOut = ctx.createGain(); this.nodes.presetIn.connect(pIn); pOut.connect(this.nodes.presetOut); try { preset.build(ctx, pIn, pOut); if (!isOffline) this.activePluginConnections = { in: pIn, out: pOut }; } catch(e) { console.error(e); if (!isOffline) SysUI.toast("Plugin Error: " + e.message, "error"); this.nodes.presetIn.connect(this.nodes.presetOut); } },
    applyPreset(name) { this.activePresetId = name; document.querySelectorAll('button[onclick*="applyPreset"]').forEach(b => { b.classList.remove('border-[#54d7f6]', 'text-[#54d7f6]'); if(b.getAttribute('onclick').includes(`'${name}'`)) { b.classList.add('border-[#54d7f6]', 'text-[#54d7f6]'); } }); if (this.presetRegistry[name]) { if(this.isPlaying) this.injectCustomGraph(name, this.audioContext); this.applyParamsJSON('normal'); } else { if (this.isPlaying && this.activePluginConnections) { this.injectCustomGraph(null, this.audioContext); } this.applyParamsJSON(name); } localStorage.setItem('flowork_last_preset', name); },
    getCurrentState() { const ids = ['pitch','formant','tune','chaos','glitch','hiveMix','hiveSpread','auraMix','auraType','warp','year','width','rotate','shift','rmix','modRate','modDepth','lpf','hpf','dist','crush','reverb','delay','gain','gate']; const params = {}; ids.forEach(id => { const el = document.getElementById('param-'+id); if(el) params[id] = parseFloat(el.value); }); return params; },
    setUIParams(params) { Object.keys(params).forEach(k => { const el = document.getElementById('param-'+k); if(el) { el.value = params[k]; el.dispatchEvent(new Event('input')); } }); },
    saveProfile() { SysUI.prompt("SAVE PRESET", (name) => { if(!name) return; const data = this.getCurrentState(); const saved = JSON.parse(localStorage.getItem('flowork_custom_presets') || '{}'); saved[name] = data; localStorage.setItem('flowork_custom_presets', JSON.stringify(saved)); SysUI.toast(`PRESET "${name}" SAVED`, "success"); this.renderCustomPresetsUI(); }); },
    loadProfile(name) { const saved = JSON.parse(localStorage.getItem('flowork_custom_presets') || '{}'); if(saved[name]) { this.activePresetId = name; this.setUIParams(saved[name]); if(this.isPlaying && this.activePluginConnections) this.injectCustomGraph(null, this.audioContext); SysUI.toast(`LOADED: ${name}`, "info"); } else { SysUI.toast("PRESET NOT FOUND", "error"); } },
    deleteProfile(name) { SysUI.confirm("DELETE PRESET", `Are you sure you want to delete profile "${name}"?`, () => { const saved = JSON.parse(localStorage.getItem('flowork_custom_presets') || '{}'); delete saved[name]; localStorage.setItem('flowork_custom_presets', JSON.stringify(saved)); this.renderCustomPresetsUI(); SysUI.toast(`DELETED: ${name}`, "info"); }); },
    exportProfile() { const data = { version: "2.0", timestamp: new Date().toISOString(), params: this.getCurrentState() }; const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `FLOWORK_PRESET_${Date.now()}.json`; a.click(); SysUI.toast("EXPORT GENERATED", "success"); },
    importProfile() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = e => { const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = res => { try { const json = JSON.parse(res.target.result); if(json.params) { this.setUIParams(json.params); if(this.isPlaying && this.activePluginConnections) this.injectCustomGraph(null, this.audioContext); SysUI.toast("SETTINGS IMPORTED", "success"); } else { SysUI.toast("INVALID JSON FILE", "error"); } } catch(err) { SysUI.toast("PARSE ERROR", "error"); } }; r.readAsText(f); }; input.click(); },
    renderCustomPresetsUI() { const container = document.getElementById('custom-presets-list'); if(!container) return; const saved = JSON.parse(localStorage.getItem('flowork_custom_presets') || '{}'); let html = ''; Object.keys(saved).forEach(name => { html += `<div class="flex items-center gap-1 group"><button onclick="window.AudioCore.loadProfile('${name}')" class="flex-1 p-2 bg-[#171925] text-[10px] text-cyan-400 rounded border border-cyan-900 hover:bg-cyan-900/30 hover:text-white font-bold text-left transition-all truncate">USER: ${name.toUpperCase()}</button><button onclick="window.AudioCore.deleteProfile('${name}')" class="p-2 text-red-500 hover:text-white hover:bg-red-900 rounded opacity-0 group-hover:opacity-100 transition-all">&times;</button></div>`; }); container.innerHTML = html || '<div class="text-[9px] text-gray-600 italic p-2 text-center">NO DATA</div>'; },
    loadLastSession() { this.renderCustomPresetsUI(); },
    applyParamsJSON(name) { const p = { 'normal': { pitch:0, formant:0, tune:0, chaos:0, glitch:0, hiveMix:0, hiveSpread:0, auraMix:0, auraType:0, warp:0, year:100, width:0, rotate:0, shift:0, rmix:0, modRate:0, modDepth:0, lpf:22000, hpf:0, dist:0, crush:0, reverb:0, delay:0, gain:1, gate:-100 }, 'hive_queen': { pitch:0, formant:0, tune:20, chaos:0, glitch:0, hiveMix:80, hiveSpread:50, auraMix:0, auraType:0, warp:0, year:100, width:0, rotate:0, shift:0, rmix:0, modRate:0, modDepth:0, lpf:22000, hpf:0, dist:0, crush:0, reverb:2.0, delay:0, gain:1, gate:-100 }, 'fire_mage': { pitch:-200, formant:-100, tune:0, chaos:0, glitch:0, hiveMix:0, hiveSpread:0, auraMix:40, auraType:-80, warp:10, year:50, width:0, rotate:0, shift:0, rmix:0, modRate:0, modDepth:0, lpf:22000, hpf:0, dist:30, crush:0, reverb:1.0, delay:0, gain:1, gate:-30 }, 'vhs_ghost': { pitch:0, formant:0, tune:0, chaos:0, glitch:0, hiveMix:0, hiveSpread:0, auraMix:20, auraType:100, warp:60, year:-50, width:0, rotate:0, shift:0, rmix:0, modRate:0, modDepth:0, lpf:22000, hpf:0, dist:0, crush:0.3, reverb:0, delay:0, gain:1, gate:-100 }, 'hacker': { pitch:1710, formant:280, tune:0, chaos:0, glitch:0, hiveMix:0, hiveSpread:0, auraMix:0, auraType:0, warp:0, year:100, width:0, rotate:0, shift:0, rmix:0, modRate:0, modDepth:0, lpf:22000, hpf:0, dist:0, crush:0, reverb:0, delay:0, gain:1, gate:-100 } }[name]; if(p) this.setUIParams(p); },
    updateParams(ctx = this.audioContext) { if(!this.nodes.master) return; const isOffline = (ctx !== this.audioContext); const now = isOffline ? 0 : ctx.currentTime + 0.05; const setVal = (param, value) => { if (isOffline) { param.setValueAtTime(value, 0); } else { param.setTargetAtTime(value, now, 0.1); } }; const v = (id) => { const el = document.getElementById('param-'+id); const val = el ? parseFloat(el.value) : 0; const disp = document.getElementById('val-'+id); if(disp) disp.innerText = val; return val; }; const gFreq = v('gate') <= -90 ? 0 : (v('gate') + 100) * 10; setVal(this.nodes.denoiseGate.frequency, gFreq); if(v('pitch') !== 0) { setVal(this.nodes.pitchLfo.frequency, 10); setVal(this.nodes.pitchGain.gain, (v('pitch')/2400)*0.02); } else { setVal(this.nodes.pitchGain.gain, 0); } setVal(this.nodes.formantFilter.frequency, Math.abs(1000+v('formant'))); setVal(this.nodes.formantFilter.gain, v('formant')!==0?15:0); setVal(this.nodes.tunerGain.gain, v('tune')/100); setVal(this.nodes.glitchLfo.frequency, Math.abs(v('chaos'))); setVal(this.nodes.glitchGain.gain, (v('glitch')/100)*0.05); setVal(this.nodes.hiveGain.gain, v('hiveMix')/100); const spread = v('hiveSpread') / 100; setVal(this.nodes.hivePanL.pan, -spread); setVal(this.nodes.hivePanR.pan, spread); setVal(this.nodes.auraGain.gain, v('auraMix')/100); let auraF = 1000; if(v('auraType')<0) auraF = 100 + (100+v('auraType'))*5; else auraF = 1000 + v('auraType')*50; setVal(this.nodes.auraFilter.frequency, auraF); setVal(this.nodes.warpGain.gain, (v('warp')/100)*0.005); const age = v('year'); let warpFreq = 20000; if(age < 0) warpFreq = 500 + (100+age)*20; const manualLpf = Math.abs(v('lpf')); setVal(this.nodes.lpf.frequency, manualLpf < 21000 ? manualLpf : warpFreq); setVal(this.nodes.osc.frequency, Math.abs(v('shift'))); setVal(this.nodes.modGain.gain, v('rmix')); setVal(this.nodes.dryMod.gain, 1-v('rmix')); setVal(this.nodes.modLFO.frequency, Math.abs(v('modRate'))); setVal(this.nodes.modDepth.gain, v('modDepth')); setVal(this.nodes.hpf.frequency, Math.abs(v('hpf'))); if(this.nodes.dist) this.nodes.dist.curve = this.makeDistortionCurve(v('dist')); if(this.nodes.crush) this.nodes.crush.curve = this.makeBitCrusherCurve(Math.abs(v('crush'))); setVal(this.nodes.pannerLfo.frequency, v('rotate')); setVal(this.nodes.pannerDepth.gain, v('width')/100); setVal(this.nodes.reverbGain.gain, v('reverb')); setVal(this.nodes.delay.delayTime, v('delay')); setVal(this.nodes.delayGain.gain, v('delay')>0?0.5:0); setVal(this.nodes.master.gain, v('gain')); },
    makeStepperCurve(steps){const n=44100,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=Math.round(x*steps)/steps;}return c;},
    makeDistortionCurve(k){if(k==0)return null;const n=44100,c=new Float32Array(n);for(let i=0;i<n;++i){const x=i*2/n-1;c[i]=(3+k)*x*20*(Math.PI/180)/(Math.PI+k*Math.abs(x));}return c;},
    makeBitCrusherCurve(a){if(a==0)return null;const n=44100,c=new Float32Array(n),s=4+(1-a)*12;for(let i=0;i<n;i++)c[i]=Math.round((i*2/n-1)*s)/s;return c;},
    createNoiseBuffer() { const bs = this.audioContext.sampleRate * 5; const b = this.audioContext.createBuffer(1, bs, this.audioContext.sampleRate); const o = b.getChannelData(0); for(let i=0;i<bs;i++) o[i] = (Math.random()*2-1)*0.5; this.noiseBuffer = b; },
    impulseResponse(ctx,d,dec){const l=ctx.sampleRate*d,b=ctx.createBuffer(2,l,ctx.sampleRate);for(let i=0;i<l;i++){const n=i/l;b.getChannelData(0)[i]=(Math.random()*2-1)*Math.pow(1-n,dec);b.getChannelData(1)[i]=(Math.random()*2-1)*Math.pow(1-n,dec);}return b;},
    bufferToWave(abuffer,len){let numOfChan=abuffer.numberOfChannels,length=len*numOfChan*2+44,buffer=new ArrayBuffer(length),view=new DataView(buffer),channels=[],i,sample,offset=0,pos=0;function setUint16(data){view.setUint16(pos,data,true);pos+=2;}function setUint32(data){view.setUint32(pos,data,true);pos+=4;}setUint32(0x46464952);setUint32(length-8);setUint32(0x45564157);setUint32(0x20746d66);setUint32(16);setUint16(1);setUint16(numOfChan);setUint32(abuffer.sampleRate);setUint32(abuffer.sampleRate*2*numOfChan);setUint16(numOfChan*2);setUint16(16);setUint32(0x61746164);setUint32(length-pos-4);for(i=0;i<abuffer.numberOfChannels;i++)channels.push(abuffer.getChannelData(i));while(pos<len){for(i=0;i<numOfChan;i++){sample=Math.max(-1,Math.min(1,channels[i][pos]));sample=(0.5+sample<0?sample*32768:sample*32767)|0;view.setInt16(44+offset,sample,true);offset+=2;}pos++;}return new Blob([buffer],{type:"audio/wav"});},
    handleFile(input) { const f=input.files[0]; if(!f)return; document.getElementById('filename-display').innerText=f.name; this.fileName=f.name.replace(/\.[^/.]+$/, ""); this.initCtx(); f.arrayBuffer().then(b=>this.audioContext.decodeAudioData(b)).then(d=>this.sourceBuffer=d); },
    setSourceMode(mode) { const f=document.getElementById('panel-file'), m=document.getElementById('panel-mic'), bf=document.getElementById('tab-file'), bm=document.getElementById('tab-mic'); if(mode=='file'){ f.classList.remove('hidden'); m.classList.add('hidden'); bf.classList.add('bg-[#54d7f6]','text-black'); bm.classList.remove('bg-[#54d7f6]','text-black'); } else { m.classList.remove('hidden'); f.classList.add('hidden'); bm.classList.add('bg-[#54d7f6]','text-black'); bf.classList.remove('bg-[#54d7f6]','text-black'); } },

    async processAndDownload() {
        if(!this.sourceBuffer) return SysUI.toast("NO AUDIO TO RENDER", "error");
        const btn = document.querySelector('button[onclick*="processAndDownload"]');
        const oldBtnContent = btn.innerHTML;
        const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]; let frameIdx = 0;
        const animInterval = setInterval(() => { btn.innerHTML = `<span class="animate-pulse font-mono text-[#54d7f6]">${frames[frameIdx]}</span> PROCESSING...`; frameIdx = (frameIdx + 1) % frames.length; }, 100);
        SysUI.toast("INITIALIZING RENDER PROTOCOL...", "info");
        console.log("%c[RENDER] System initialized. Preparing Offline Buffer...", "color: #54d7f6");
        setTimeout(async () => {
            try {
                console.log(`[RENDER] Creating Offline Context. Length: ${this.sourceBuffer.length}, Rate: ${this.sourceBuffer.sampleRate}`);
                const offCtx = new OfflineAudioContext(2, this.sourceBuffer.length + 44100*2, this.sourceBuffer.sampleRate);
                const src = offCtx.createBufferSource(); src.buffer = this.sourceBuffer;
                this.noiseBuffer = this.noiseBuffer;
                const liveNodesBackup = this.nodes; // Backup Live Nodes
                console.log("[RENDER] Constructing DSP Graph...");
                await this.buildAudioGraph(offCtx, src, true);
                console.log("[RENDER] Starting Offline Rendering (Async)...");
                src.start(0); const rendered = await offCtx.startRendering();
                console.log("[RENDER] Rendering Complete. Buffer generated.");
                console.log("[RENDER] Encoding to WAV...");
                const wav = this.bufferToWave(rendered, rendered.length);
                const a = document.createElement('a'); a.href = URL.createObjectURL(wav); a.download = `VOX_RESULT_${Date.now()}.wav`;
                console.log("[RENDER] Triggering Download...");
                a.click();
                this.nodes = liveNodesBackup; // Restore Live Nodes
                clearInterval(animInterval); btn.innerHTML = oldBtnContent;
                SysUI.toast("RENDER COMPLETE // FILE DOWNLOADED", "success");
                console.log("%c[RENDER] Process finished successfully.", "color: #00ff00");
            } catch (e) { console.error("[RENDER] FATAL ERROR:", e); clearInterval(animInterval); btn.innerHTML = oldBtnContent; SysUI.toast("RENDER FAILED: " + e.message, "error"); }
        }, 100);
    },

    async runAI() {
        if (!this.sourceBuffer) return SysUI.toast("NO AUDIO TO PROCESS", "error");
        const btn = document.getElementById('btn-ai-clean');
        const oldHtml = btn.innerHTML;
        btn.innerHTML = `<span class="animate-spin">◷</span> PROCESSING...`;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        setTimeout(async () => {
            try {
                if (!window.FloworkAI) throw new Error("AI Module not loaded");
                const resultBuffer = await window.FloworkAI.processAudioBuffer(this.sourceBuffer);
                if (resultBuffer) {
                    this.sourceBuffer = resultBuffer;
                    if (this.isPlaying) this.togglePreview();
                    SysUI.toast("AUDIO PURIFIED BY NEURAL NET", "success");
                    document.getElementById('filename-display').innerText += " [AI_CLEAN]";
                }
            } catch(e) { console.error(e); SysUI.toast("AI EXECUTION FAILED", "error"); }
            btn.innerHTML = oldHtml;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }, 100);
    }
};
