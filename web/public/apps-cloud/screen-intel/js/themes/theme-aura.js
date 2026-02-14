if(window.AvatarManager) {
    window.AvatarManager.register('anime_aura', 'Super Power Aura', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.5; // Kick super kuat
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- 1. GOLDEN AURA FLAMES ---
        // Api bergerak cepat ke atas
        const spikes = 30;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + (intensity * 0.5)})`; // Emas

        for(let i=0; i<spikes; i++) {
            ctx.save();
            const angle = (Math.PI * 2 / spikes) * i;
            // Aura bergerak acak + rotasi lambat
            const flameLen = (Math.sin(time * 20 + i) * 10) + (kick * 80) + 10;

            ctx.rotate(angle + (time * 0.5));

            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(radius + flameLen, -5); // Runcing
            ctx.lineTo(radius + flameLen, 5);
            ctx.fill();
            ctx.restore();
        }

        // --- 2. ELECTRIC SPARKS (Listrik) ---
        // Muncul kalau volume > 20%
        if(intensity > 0.2) {
            ctx.strokeStyle = "#88ffff"; // Biru listrik
            ctx.lineWidth = 2;
            ctx.beginPath();
            const sparkCount = 3 + Math.floor(kick * 10);

            for(let j=0; j<sparkCount; j++) {
                const rot = Math.random() * Math.PI * 2;
                const dist = radius + (Math.random() * 50);

                // Gambar garis zig-zag
                const sx = Math.cos(rot) * dist;
                const sy = Math.sin(rot) * dist;
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + (Math.random()*20-10), sy + (Math.random()*20-10));
            }
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#fff";
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // --- 3. AVATAR ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Power Up Tint (Kuning)
            if(intensity > 0.5) {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = `rgba(255, 255, 0, ${intensity * 0.4})`;
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    });
}