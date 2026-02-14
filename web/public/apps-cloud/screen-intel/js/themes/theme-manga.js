if(window.AvatarManager) {
    window.AvatarManager.register('anime_manga', 'Manga Action', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.5; // Kick gede banget biar dramatis
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        // JANGAN scale pulse di sini untuk speed lines, biar speed lines tetep full screen
        // Kita scale avatar aja nanti

        // --- 1. SPEED LINES (Radial Impact) ---
        // Garis-garis hitam memusat
        if(intensity > 0.1) {
            ctx.save();
            const lines = 40;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2 + (kick * 5); // Garis menebal pas teriak

            for(let i=0; i<lines; i++) {
                if(Math.random() > 0.5) continue; // Random lines
                ctx.beginPath();
                const angle = (Math.PI*2 / lines) * i;
                const rInner = radius + 10 + (Math.random() * 20);
                const rOuter = radius + 100 + (kick * 100);

                ctx.moveTo(Math.cos(angle)*rInner, Math.sin(angle)*rInner);
                ctx.lineTo(Math.cos(angle)*rOuter, Math.sin(angle)*rOuter);
                ctx.stroke();
            }
            ctx.restore();
        }

        // --- 2. AVATAR (Komik Style) ---
        ctx.save();
        ctx.scale(pulse, pulse); // Avatar membesar

        if(img) {
            // White Border tebal (Outline stiker)
            ctx.beginPath();
            ctx.arc(0, 0, radius + 5, 0, Math.PI*2);
            ctx.fillStyle = "white";
            ctx.fill();

            // Avatar
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Halftone Pattern (Titik-titik komik)
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            for(let i=-radius; i<radius; i+=4) {
                for(let j=-radius; j<radius; j+=4) {
                    if((i+j)%2===0) ctx.fillRect(i, j, 1, 1);
                }
            }
        }
        ctx.restore();

        // --- 3. SFX TEXT (Onomatope) ---
        // Muncul tulisan "MENACING" atau "GO!" pas teriak
        if(intensity > 0.5) {
            ctx.save();
            // Getar teks
            ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);

            ctx.font = "bold 20px sans-serif";
            ctx.fillStyle = "purple";
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;

            const text = "ゴ ゴ ゴ"; // "Go Go Go" (Menacing - JoJo Ref)
            ctx.strokeText(text, radius, -radius);
            ctx.fillText(text, radius, -radius);
            ctx.restore();
        }

        ctx.restore();
    });
}