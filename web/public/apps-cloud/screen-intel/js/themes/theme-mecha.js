if(window.AvatarManager) {
    window.AvatarManager.register('anime_mecha', 'Mecha Pilot', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        const color = "#00ff00"; // Green Neon Gundam

        // --- 1. HEXAGON FRAME ---
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            // Hexagon luar berputar dikit pas kick
            const rHex = radius + 5 + (kick * 10);
            ctx.lineTo(rHex * Math.cos(angle), rHex * Math.sin(angle));
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- 2. LOCK-ON BRACKETS ---
        // 4 Siku yang mendekat/menjauh
        const bracketDist = radius + 15 + (kick * 20);
        const bSize = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        // Gambar 4 siku
        [0, 90, 180, 270].forEach(deg => {
            ctx.save();
            ctx.rotate(deg * Math.PI / 180);
            ctx.translate(bracketDist, 0);
            ctx.beginPath();
            ctx.moveTo(-bSize, -bSize); // L shape
            ctx.lineTo(0, -bSize);
            ctx.lineTo(0, bSize);
            ctx.lineTo(-bSize, bSize);
            ctx.stroke();
            ctx.restore();
        });

        // --- 3. AVATAR ---
        if(img) {
            ctx.save();
            // Clip Hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(radius * Math.cos(i * Math.PI / 3), radius * Math.sin(i * Math.PI / 3));
            }
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Grid Overlay (Hijau tipis)
            ctx.strokeStyle = "rgba(0, 255, 0, 0.2)";
            ctx.lineWidth = 1;
            for(let i=-radius; i<radius; i+=10) {
                ctx.beginPath(); ctx.moveTo(i, -radius); ctx.lineTo(i, radius); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-radius, i); ctx.lineTo(radius, i); ctx.stroke();
            }
            ctx.restore();
        }

        // --- 4. TARGET TEXT ---
        if(intensity > 0.1) {
            ctx.fillStyle = color;
            ctx.font = "8px monospace";
            ctx.fillText("TARGET_LOCKED", -30, radius + 25);
            // Bar graph volume
            ctx.fillRect(-radius, radius + 30, size * intensity, 3);
        }

        ctx.restore();
    });
}