//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\story-sequencer\js\core.js total lines 670 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * COMIC SEQUENCER v5.1 (AUTO-SIZE & HIT-TEST FIX)
 * Features: Auto-expanding Bubbles, Layered Hit Testing, 9:16 Support
 */

let slides = [];
let slideCounter = 0;
let activeSlideId = null;
let isInitialized = false;

const BASE_W = 1080;
const BASE_H = 1920;
const LAYOUTS = {
    'single': { slots: 1 },
    'split-v': { slots: 2 },
    'split-h': { slots: 2 },
    'quad': { slots: 4 }
};

let zoomLevel = 0.5;
let dragTarget = null; // {type: 'bubble'|'tail'|'caption'|'image', index: 0, slotIdx: 0}
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let globalCaptionOffset = { x: 0, y: 0 };
let cachedCaptionRect = null; // Store caption bounds for hit testing

function getVal(id, fallback) {
    const el = document.getElementById(id);
    if (!el) return fallback;
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'range' || el.type === 'number') return parseFloat(el.value) || fallback;
    return el.value;
}

export function init() {
    if (!document.getElementById('livePreviewCanvas')) {
        setTimeout(init, 200); return;
    }
    if (isInitialized) return;
    console.log("[ComicSequencer v5.1] Engine Online.");

    setupGlobals();
    setupTabs();
    setupCanvasInteraction();
    setupZoomWheel();
    setupInputs();

    document.getElementById('addSlideBtn')?.addEventListener('click', () => addSlide());
    document.getElementById('generateBtn')?.addEventListener('click', generateAll);
    document.getElementById('addBubbleBtn')?.addEventListener('click', () => addBubble('speech'));
    document.getElementById('addThoughtBtn')?.addEventListener('click', () => addBubble('thought'));
    document.getElementById('delBubbleBtn')?.addEventListener('click', deleteActiveBubble);

    if(slides.length === 0) addSlide();
    updateZoom(zoomLevel);
    isInitialized = true;
}

function setupGlobals() {
    window.adjustZoom = (delta) => {
        let newZoom = parseFloat((zoomLevel + delta).toFixed(1));
        newZoom = Math.min(Math.max(newZoom, 0.1), 4.0);
        updateZoom(newZoom);
    };

    window.changeLayout = (layout) => {
        if (!activeSlideId) return;
        const slide = slides.find(s => s.id === activeSlideId);
        slide.layout = layout;

        document.querySelectorAll('.grid-opt').forEach(el => el.classList.remove('active'));
        document.querySelector(`.grid-opt[data-layout="${layout}"]`)?.classList.add('active');

        const reqSlots = LAYOUTS[layout].slots;
        while(slide.images.length < reqSlots) {
            slide.images.push(null);
            slide.imgOffsets.push({x:0, y:0});
        }

        renderSlideItemUI(slide.id);
        triggerPreview(true);
    };

    window.uploadImg = (id, idx, input) => {
        const file = input.files[0];
        if (file) {
            const slide = slides.find(s => s.id === id);
            slide.images[idx] = file;
            if(!slide.imgOffsets[idx]) slide.imgOffsets[idx] = {x:0, y:0};
            renderSlideItemUI(id);
            setActiveSlide(id);
        }
    };

    window.removeSlide = (id) => {
        slides = slides.filter(s => s.id !== id);
        document.getElementById(id)?.remove();
        if (activeSlideId === id) {
            activeSlideId = null;
            if (slides.length > 0) setActiveSlide(slides[Math.max(0, slides.length-1)].id);
            else {
                const ctx = document.getElementById('livePreviewCanvas').getContext('2d');
                ctx.clearRect(0,0,1000,1000);
                document.getElementById('noPreviewMsg').style.display = 'block';
            }
        }
    };
}

function setupZoomWheel() {
    const wrapper = document.getElementById('stageWrapper');
    if(wrapper) {
        wrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            window.adjustZoom(delta);
        }, { passive: false });
    }
}

function updateZoom(lvl) {
    zoomLevel = lvl;
    const container = document.getElementById('canvasContainer');
    const display = document.getElementById('zoomDisplay');
    if(container) container.style.transform = `scale(${lvl})`;
    if(display) display.innerText = Math.round(lvl*100)+'%';
}


let previewTimer;
function triggerPreview(imm) {
    if(imm) updatePreview();
    else { clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 15); }
}

async function updatePreview() {
    const canvas = document.getElementById('livePreviewCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const msg = document.getElementById('noPreviewMsg');

    const slide = slides.find(s => s.id === activeSlideId);
    if (!slide) {
        if(msg) msg.style.display = 'block';
        return;
    }
    if(msg) msg.style.display = 'none';

    const s = getSettings();
    canvas.width = BASE_W;
    canvas.height = BASE_H;
    if(s.captionPos === 'below') canvas.height += (BASE_H * 0.25);

    await renderSlide(ctx, slide, s, canvas.width, canvas.height);
}

async function renderSlide(ctx, slide, s, w, h, isFinal = false) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    const gap = s.gapSize;
    const slots = LAYOUTS[slide.layout].slots;
    const images = slide.images;
    const offsets = slide.imgOffsets || [];

    let zones = calculateZones(slide.layout, w, (s.captionPos==='below' ? h-(h*0.2) : h), gap);
    slide._cachedZones = zones;

    for (let i = 0; i < slots; i++) {
        const zone = zones[i];
        const imgFile = images[i];
        const off = offsets[i] || {x:0,y:0};

        ctx.fillStyle = "#eee";
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

        if (imgFile) {
            const img = await loadImage(imgFile);
            const scale = Math.max(zone.w / img.width, zone.h / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            const dx = zone.x + (zone.w - dw) / 2 + off.x;
            const dy = zone.y + (zone.h - dh) / 2 + off.y;

            ctx.save();
            ctx.beginPath();
            ctx.rect(zone.x, zone.y, zone.w, zone.h);
            ctx.clip();
            ctx.drawImage(img, dx, dy, dw, dh);
            if(s.mangaMode) applyMangaFilter(ctx, zone.x, zone.y, zone.w, zone.h);
            ctx.restore();
        }
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
    }

    if (slide.caption) {
        cachedCaptionRect = drawCaption(ctx, slide.caption, s, w, h);
    } else {
        cachedCaptionRect = null;
    }

    if (slide.bubbles) {
        slide.bubbles.forEach((b, idx) => {
            const isSelected = (!isFinal && dragTarget && dragTarget.type === 'bubble' && dragTarget.index === idx);
            drawBubble(ctx, b, w/BASE_W, isSelected);
        });
    }

    if (isFinal && s.addNoise) addNoise(ctx, w, h);
}

function calculateZones(layout, w, h, gap) {
    let zones = [];
    if (layout === 'single') {
        zones.push({x:0, y:0, w:w, h:h});
    } else if (layout === 'split-v') {
        let hh = (h-gap)/2;
        zones.push({x:0, y:0, w:w, h:hh});
        zones.push({x:0, y:hh+gap, w:w, h:hh});
    } else if (layout === 'split-h') {
        let hw = (w-gap)/2;
        zones.push({x:0, y:0, w:hw, h:h});
        zones.push({x:hw+gap, y:0, w:hw, h:h});
    } else if (layout === 'quad') {
        let hw = (w-gap)/2, hh = (h-gap)/2;
        zones.push({x:0, y:0, w:hw, h:hh});
        zones.push({x:hw+gap, y:0, w:hw, h:hh});
        zones.push({x:0, y:hh+gap, w:hw, h:hh});
        zones.push({x:hw+gap, y:hh+gap, w:hw, h:hh});
    }
    return zones;
}

function drawCaption(ctx, text, s, w, h) {
    const scale = w / BASE_W;
    const fontSize = s.captionSize * scale * 1.5;
    ctx.font = `bold ${fontSize}px "${s.captionFont}"`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    const words = text.split(' ');
    let lines = [], line = '';
    const pad = s.captionPadding * scale * 2;
    const maxW = w * 0.9 - pad;
    for(let n=0;n<words.length;n++) {
        let test = line + words[n] + ' ';
        if(ctx.measureText(test).width > maxW && n>0) { lines.push(line); line = words[n]+' '; }
        else line = test;
    }
    lines.push(line);

    const lh = fontSize * 1.4;
    const boxH = (lines.length * lh) + pad;
    const boxW = w * 0.95;

    let bx = (w - boxW)/2;
    let by = h - boxH - (20*scale);
    if (s.captionPos === 'top') by = 50*scale;
    else if (s.captionPos === 'middle') by = (h-boxH)/2;
    else if (s.captionPos === 'below') by = h - boxH;
    else if (s.captionPos === 'custom') {
        by = (h/2) + (globalCaptionOffset.y * scale);
        bx += (globalCaptionOffset.x * scale);
    }

    ctx.save();
    ctx.globalAlpha = s.captionOpacity;
    ctx.fillStyle = s.captionBg;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.restore();

    ctx.fillStyle = s.captionColor;
    const startY = by + (pad/2) + (lh/2);
    lines.forEach((l, i) => {
        ctx.fillText(l, bx + boxW/2, startY + (i*lh) - (lh*0.1));
    });

    return { x: bx, y: by, w: boxW, h: boxH };
}

function drawBubble(ctx, b, scale, isSel) {
    const x = b.x * scale;
    const y = b.y * scale;

    ctx.font = `bold ${b.size*scale}px Arial`;
    const rawLines = b.text.split('\n');
    let lines = [];
    const maxW = Math.max(300 * scale, b.size*scale*10);

    let maxLineW = 0;
    rawLines.forEach(raw => {
        const words = raw.split(' ');
        let line = '';
        words.forEach(word => {
            const test = line + word + ' ';
            if(ctx.measureText(test).width > maxW) {
                lines.push(line);
                maxLineW = Math.max(maxLineW, ctx.measureText(line).width);
                line = word + ' ';
            } else line = test;
        });
        lines.push(line);
        maxLineW = Math.max(maxLineW, ctx.measureText(line).width);
    });

    const lh = b.size * scale * 1.3;
    const totalH = lines.length * lh;

    const padding = 40 * scale;
    const w = Math.max(100*scale, maxLineW + padding);
    const h = Math.max(80*scale, totalH + padding);

    b.w = w / scale; // Store unscaled
    b.h = h / scale;

    const tx = b.tailX * scale;
    const ty = b.tailY * scale;

    ctx.save();
    ctx.translate(0,0);
    ctx.fillStyle = b.bg;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3 * scale;

    ctx.beginPath();
    if(b.type === 'thought') {
        ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI*2);
    } else {
        if(ctx.roundRect) ctx.roundRect(x-w/2, y-h/2, w, h, 30*scale);
        else ctx.rect(x-w/2, y-h/2, w, h);
    }
    ctx.fill(); ctx.stroke();

    if(b.type === 'speech') {
        ctx.beginPath();
        ctx.moveTo(x, y+h/2-2);
        ctx.lineTo(tx, ty);
        ctx.lineTo(x+30*scale, y+h/2-2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+2*scale, y+h/2); ctx.lineTo(x+28*scale, y+h/2);
        ctx.strokeStyle = b.bg; ctx.lineWidth = 5*scale; ctx.stroke();
    }

    if(isSel) {
        ctx.strokeStyle = "#00f5ff"; ctx.lineWidth=3;
        ctx.strokeRect(x-w/2-5, y-h/2-5, w+10, h+10);
        ctx.fillStyle="#ff0080"; ctx.beginPath(); ctx.arc(tx,ty,12,0,Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = b.color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    const startY = y - (totalH/2) + (lh/2);
    lines.forEach((l, i) => {
        ctx.fillText(l, x, startY + (i*lh));
    });

    ctx.restore();
}


function setupCanvasInteraction() {
    const canvas = document.getElementById('livePreviewCanvas');
    if(!canvas) return;

    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (canvas.width/r.width),
            y: (e.clientY - r.top) * (canvas.height/r.height)
        };
    };

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        const pos = getPos(e);
        const slide = slides.find(s => s.id === activeSlideId);
        if(!slide) return;
        const scale = canvas.width / BASE_W;

        if(slide.bubbles) {
            for(let i=slide.bubbles.length-1; i>=0; i--) {
                const b = slide.bubbles[i];
                const bx = b.x*scale, by = b.y*scale, bw = b.w*scale, bh = b.h*scale;
                if(pos.x > bx-bw/2 && pos.x < bx+bw/2 && pos.y > by-bh/2 && pos.y < by+bh/2) {
                    slide.bubbles.splice(i, 1);
                    triggerPreview(true);
                    return;
                }
            }
        }

        if(cachedCaptionRect) {
            const r = cachedCaptionRect;
            if(pos.x >= r.x && pos.x <= r.x+r.w && pos.y >= r.y && pos.y <= r.y+r.h) {
                if(confirm("Clear Caption?")) {
                    slide.caption = "";
                    document.getElementById('captionText').value = "";
                    triggerPreview(true);
                }
            }
        }
    });

    canvas.addEventListener('mousedown', e => {
        if(e.button === 2) return;
        const pos = getPos(e);
        const slide = slides.find(s => s.id === activeSlideId);
        if(!slide) return;

        const scale = canvas.width / BASE_W;
        let hit = null;

        if(slide.bubbles) {
            for(let i=slide.bubbles.length-1; i>=0; i--) {
                const b = slide.bubbles[i];
                const tx = b.tailX*scale, ty = b.tailY*scale;
                if(Math.hypot(pos.x-tx, pos.y-ty) < 30) { hit = {type:'tail', index:i}; break; }
                const bx = b.x*scale, by = b.y*scale, bw = b.w*scale, bh = b.h*scale;
                if(pos.x > bx-bw/2 && pos.x < bx+bw/2 && pos.y > by-bh/2 && pos.y < by+bh/2) {
                    hit = {type:'bubble', index:i}; break;
                }
            }
        }

        if(hit) {
            isDragging = true; dragTarget = hit;
            updateBubbleUI(slide.bubbles[hit.index]);
        } else {
            if(cachedCaptionRect &&
               pos.x >= cachedCaptionRect.x && pos.x <= cachedCaptionRect.x+cachedCaptionRect.w &&
               pos.y >= cachedCaptionRect.y && pos.y <= cachedCaptionRect.y+cachedCaptionRect.h) {

                isDragging = true; dragTarget = {type:'caption'};
                updateBubbleUI(null);
                document.querySelector('.tab[data-tab="caption"]').click();
                document.getElementById('captionPos').value = 'custom';
            }
            else {
                const zones = slide._cachedZones || [];
                let slotHit = -1;
                for(let i=0; i<zones.length; i++) {
                    const z = zones[i];
                    if(pos.x >= z.x && pos.x <= z.x+z.w && pos.y >= z.y && pos.y <= z.y+z.h) {
                        slotHit = i; break;
                    }
                }
                if(slotHit !== -1) {
                    isDragging = true; dragTarget = {type:'image', slotIdx: slotHit};
                    updateBubbleUI(null);
                }
            }
        }
        dragStartX = pos.x; dragStartY = pos.y;
        triggerPreview(true);
    });

    window.addEventListener('mousemove', e => {
        if(!isDragging || !dragTarget) return;
        const pos = getPos(e);
        const slide = slides.find(s => s.id === activeSlideId);
        const scale = canvas.width / BASE_W;
        const dx = (pos.x - dragStartX) / scale;
        const dy = (pos.y - dragStartY) / scale;

        if(dragTarget.type === 'bubble') {
            const b = slide.bubbles[dragTarget.index];
            b.x += dx; b.y += dy; b.tailX += dx; b.tailY += dy;
        } else if(dragTarget.type === 'tail') {
            const b = slide.bubbles[dragTarget.index];
            b.tailX += dx; b.tailY += dy;
        } else if(dragTarget.type === 'caption') {
            globalCaptionOffset.x += dx; globalCaptionOffset.y += dy;
        } else if(dragTarget.type === 'image') {
            const offset = slide.imgOffsets[dragTarget.slotIdx];
            offset.x += dx; offset.y += dy;
        }
        dragStartX = pos.x; dragStartY = pos.y;
        triggerPreview(true);
    });

    window.addEventListener('mouseup', () => isDragging = false);
}


function addSlide() {
    slideCounter++;
    const id = `slide_${Date.now()}`;
    slides.push({
        id: id, layout: 'single',
        images: [null], imgOffsets: [{x:0, y:0}],
        caption: "", bubbles: []
    });
    renderSlideItemUI(id);
    setActiveSlide(id);
}

function renderSlideItemUI(id) {
    const container = document.getElementById('slidesList');
    const old = document.getElementById(id);
    if(old) old.remove();

    const slide = slides.find(s => s.id === id);
    const slots = LAYOUTS[slide.layout].slots;

    const el = document.createElement('div');
    el.className = 'slide-item';
    el.id = id;

    let slotsHTML = '';
    for(let i=0; i<slots; i++) {
        slotsHTML += `
            <div class="img-slot">
                <input type="file" accept="image/*" onchange="window.uploadImg('${id}', ${i}, this)">
                ${slide.images[i] ? `<img src="${URL.createObjectURL(slide.images[i])}">` : '<i class="mdi mdi-plus"></i>'}
            </div>`;
    }

    el.innerHTML = `
        <div class="layout-thumb ${slide.layout}">${slotsHTML}</div>
        <div class="slide-label">PAGE ${slideCounter}</div>
        <button class="delete-slide" onclick="window.removeSlide('${id}')"><i class="mdi mdi-close"></i></button>
    `;
    el.onclick = (e) => { if(e.target.tagName !== 'INPUT' && !e.target.closest('.delete-slide')) setActiveSlide(id); };
    container.appendChild(el);
}

function setActiveSlide(id) {
    activeSlideId = id;
    document.querySelectorAll('.slide-item').forEach(e => e.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');

    const slide = slides.find(s => s.id === id);
    document.querySelectorAll('.grid-opt').forEach(e => e.classList.remove('active'));
    document.querySelector(`.grid-opt[data-layout="${slide.layout}"]`)?.classList.add('active');

    document.getElementById('captionText').value = slide.caption || '';
    updateBubbleUI(null);
    triggerPreview();
}

function addBubble(type) {
    const slide = slides.find(s => s.id === activeSlideId);
    if(!slide) return;
    const b = { type: type, text: "Ketik di sini...", x: 540, y: 500, w: 300, h: 150, tailX: 540, tailY: 700, bg: '#fff', color: '#000', size: 35 };
    slide.bubbles.push(b);
    dragTarget = {type:'bubble', index: slide.bubbles.length-1};
    updateBubbleUI(b);
    triggerPreview(true);
}

function updateBubbleUI(b) {
    const ed = document.getElementById('bubbleEditor');
    if(!b) { ed.classList.add('hidden'); return; }
    ed.classList.remove('hidden');
    document.getElementById('bubbleText').value = b.text;
    document.getElementById('bubbleSize').value = b.size;
    document.getElementById('bubbleBgColor').value = b.bg;
    document.getElementById('bubbleTextColor').value = b.color;
    const delBtn = document.getElementById('delBubbleBtn');
    if(delBtn) delBtn.onclick = deleteActiveBubble;
}

function deleteActiveBubble() {
    if(dragTarget && dragTarget.type === 'bubble') {
        const s = slides.find(s=>s.id===activeSlideId);
        s.bubbles.splice(dragTarget.index, 1);
        dragTarget = null; updateBubbleUI(null); triggerPreview(true);
    }
}

function setupInputs() {
    ['bubbleText', 'bubbleSize', 'bubbleBgColor', 'bubbleTextColor'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            if(dragTarget?.type === 'bubble') {
                const b = slides.find(s=>s.id===activeSlideId).bubbles[dragTarget.index];
                b.text = getVal('bubbleText', '');
                b.size = getVal('bubbleSize', 30);
                b.bg = getVal('bubbleBgColor', '#fff');
                b.color = getVal('bubbleTextColor', '#000');
                triggerPreview();
            }
        });
    });

    document.getElementById('captionText')?.addEventListener('input', (e) => {
        slides.find(s=>s.id===activeSlideId).caption = e.target.value;
        triggerPreview();
    });

    document.querySelectorAll('input, select').forEach(i => {
        if(!i.id.startsWith('bubble') && i.id !== 'captionText') i.addEventListener('input', () => triggerPreview());
    });
}

function setupTabs() {
    document.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', e => {
            document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.control-section').forEach(x => x.classList.add('hidden'));
            e.target.classList.add('active');
            document.getElementById(`tab-${e.target.dataset.tab}`).classList.remove('hidden');
        });
    });
}

function loadImage(file) {
    return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = URL.createObjectURL(file); });
}

function applyMangaFilter(ctx,x,y,w,h) {
    const idata = ctx.getImageData(x,y,w,h);
    const d = idata.data;
    for(let i=0; i<d.length; i+=4) {
        const v = (d[i]+d[i+1]+d[i+2])/3 < 128 ? 0 : 255;
        d[i]=d[i+1]=d[i+2]=v;
        if(v>0 && (i/4)%2===0) d[i]=d[i+1]=d[i+2]=200;
    }
    ctx.putImageData(idata,x,y);
}

function addNoise(ctx,w,h) {
    const d = ctx.getImageData(0,0,w,h);
    for(let i=0; i<d.data.length; i+=4) if(Math.random()>0.95) d.data[i]+=5;
    ctx.putImageData(d,0,0);
}

async function generateAll() {
    const btn = document.getElementById('generateBtn');
    btn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> WORKING...'; btn.disabled = true;
    try {
        const zip = new JSZip();
        const settings = getSettings();
        for(let i=0; i<slides.length; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = BASE_W; canvas.height = BASE_H;
            if(settings.captionPos === 'below') canvas.height += (BASE_H * 0.25);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            await renderSlide(ctx, slides[i], settings, canvas.width, canvas.height, true);
            await new Promise(r => canvas.toBlob(b => { zip.file(`${i+1}.png`, b); r(); }));
        }
        const c = await zip.generateAsync({type:'blob'});
        saveAs(c, 'comic.zip');
    } catch(e) { alert(e); }
    btn.innerHTML = '<i class="mdi mdi-flash"></i> EXPORT COMIC'; btn.disabled = false;
}

function getSettings() {
    return {
        captionFont: getVal('captionFont', 'Arial'),
        captionSize: getVal('captionSize', 40),
        captionColor: getVal('captionColor', '#fff'),
        captionBg: getVal('captionBg', '#000'),
        captionOpacity: getVal('captionOpacity', 60)/100,
        captionPadding: getVal('bgPadding', 20),
        bgRadius: getVal('bgRadius', 0),
        shadowColor: getVal('shadowColor', '#000'),
        captionPos: getVal('captionPos', 'bottom'),
        gapSize: getVal('gapSize', 10),
        mangaMode: getVal('mangaMode', false),
        addNoise: getVal('addNoise', true)
    };
}
