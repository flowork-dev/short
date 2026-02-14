//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\tele-ops\js\tele-engine.js total lines 194 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * TELE OPS ENGINE V3.0 (MOBILE OPTIMIZED)
 * Fix: Teks Gak Muncul, Layout HP
 */

window.TeleEngine = {
    isPlaying: false,
    speed: 3,
    fontSize: 40,
    isMirrored: false,
    scrollPos: 0,
    lastFrameTime: 0,
    animationFrameId: null,

    elUiStudio: null,
    elUiPrompter: null,
    elScriptInput: null,
    elScrollContainer: null,
    elTeleContent: null,
    elBtnPlay: null,

    init() {
        console.log("[TeleEngine] Booting...");

        this.elUiStudio = document.getElementById('ui-studio');
        this.elUiPrompter = document.getElementById('ui-prompter');
        this.elScriptInput = document.getElementById('script-input');
        this.elScrollContainer = document.getElementById('scroll-container');
        this.elTeleContent = document.getElementById('tele-content');
        this.elBtnPlay = document.getElementById('btn-toggle-play');

        if(!this.elUiPrompter || !this.elScriptInput) {
            console.error("DOM Elements missing!");
            return;
        }

        if(!this.elScriptInput.value) this.loadDemo();

        this.bindSlider('speed-range', 'speed-val', (val) => {
            this.speed = parseInt(val);
            const flySlider = document.getElementById('fly-speed');
            if(flySlider) flySlider.value = val;
        });

        this.bindSlider('font-range', 'font-val', (val) => {
            this.fontSize = parseInt(val);
            if(this.elTeleContent) this.elTeleContent.style.fontSize = `${val}px`;
            return val + 'px'; // Format text label
        });

        const flySlider = document.getElementById('fly-speed');
        if(flySlider) {
            flySlider.addEventListener('input', (e) => this.speed = parseInt(e.target.value));
        }

        const elMirror = document.getElementById('mirror-check');
        if(elMirror) elMirror.addEventListener('change', (e) => {
            this.isMirrored = e.target.checked;
            this.applyMirror();
        });

        document.addEventListener('keydown', (e) => {
            if(!this.elUiPrompter.classList.contains('hidden')) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.togglePlay();
                }
                if (e.code === 'Escape') {
                    this.stopPrompter();
                }
            }
        });

        console.log("[TeleEngine] Ready.");
    },

    bindSlider(idInput, idLabel, callback) {
        const input = document.getElementById(idInput);
        const label = document.getElementById(idLabel);
        if(input) {
            input.addEventListener('input', (e) => {
                const res = callback(e.target.value);
                if(label) label.innerText = res || e.target.value;
            });
        }
    },


    loadDemo() {
        if(this.elScriptInput) {
            this.elScriptInput.value = `HALO KREATOR!\n\nIni adalah mode teleprompter.\nSekarang layoutnya udah rapi di HP.\n\nTips:\n1. Atur ukuran huruf biar nyaman.\n2. Klik tombol PLAY di bawah.\n3. Jangan lupa senyum!\n\n(Teks ini akan jalan otomatis ke atas...)\n\nSemangat ngontennya bro!\nFlowork V2.0`;
        }
    },

    clearText() {
        if(this.elScriptInput) {
            this.elScriptInput.value = "";
            this.elScriptInput.focus();
        }
    },


    startPrompter() {
        const text = this.elScriptInput.value.trim();
        if(!text) { alert("Isi naskah dulu bro!"); return; }

        this.elTeleContent.innerHTML = text.replace(/\n/g, '<br>');

        this.elTeleContent.style.fontSize = `${this.fontSize}px`;
        this.applyMirror();

        this.elUiStudio.classList.add('hidden');
        this.elUiPrompter.classList.remove('hidden');
        this.elUiPrompter.classList.add('flex');

        this.scrollPos = 0;
        this.elScrollContainer.scrollTop = 0;

        this.isPlaying = false;
        this.updatePlayIcon();
        setTimeout(() => this.togglePlay(true), 500);
    },

    stopPrompter() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationFrameId);

        this.elUiPrompter.classList.add('hidden');
        this.elUiPrompter.classList.remove('flex');
        this.elUiStudio.classList.remove('hidden');
    },

    resetPosition() {
        this.scrollPos = 0;
        this.elScrollContainer.scrollTop = 0;
    },

    togglePlay(forceState) {
        if (typeof forceState !== 'undefined') {
            this.isPlaying = forceState;
        } else {
            this.isPlaying = !this.isPlaying;
        }

        this.updatePlayIcon();

        if (this.isPlaying) {
            this.lastFrameTime = performance.now();
            this.animationLoop();
        } else {
            cancelAnimationFrame(this.animationFrameId);
        }
    },

    updatePlayIcon() {
        if(!this.elBtnPlay) return;
        if(this.isPlaying) {
            this.elBtnPlay.innerHTML = `<i data-lucide="pause" class="w-6 h-6 fill-current"></i>`;
        } else {
            this.elBtnPlay.innerHTML = `<i data-lucide="play" class="w-6 h-6 fill-current"></i>`;
        }
        if(window.lucide) lucide.createIcons();
    },

    applyMirror() {
        if(this.elTeleContent) {
            this.elTeleContent.style.transform = this.isMirrored ? "scaleX(-1)" : "none";
        }
    },

    animationLoop(currentTime) {
        if (!this.isPlaying) return;
        if (!this.elScrollContainer) return;

        const scrollAmount = this.speed * 0.4;

        this.scrollPos += scrollAmount;
        this.elScrollContainer.scrollTop = this.scrollPos;

        if (Math.ceil(this.elScrollContainer.scrollTop + this.elScrollContainer.clientHeight) >= this.elScrollContainer.scrollHeight) {
            this.togglePlay(false); // Pause automatically
            return;
        }

        this.lastFrameTime = currentTime;
        this.animationFrameId = requestAnimationFrame((t) => this.animationLoop(t));
    }
};
