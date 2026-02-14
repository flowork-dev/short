if(window.AvatarManager) {
    window.AvatarManager.register('mystic', 'Mystic Spirit', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.2;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- AURA LAYERS (Kabut Putar) ---
        const drawAura = (color, rotSpeed, scale) => {
            ctx.save();
            ctx.rotate(time * rotSpeed);
            ctx.scale(scale, scale);

            ctx.beginPath();
            // Bentuk random blob (bukan lingkaran sempurna)
            for (let i = 0; i <= Math.PI * 2; i += 0.5) {
                const r = radius + (Math.sin(i * 3) * 5) + 5;
                const ax = r * Math.cos(i);
                const ay = r * Math.sin(i);
                if(i===0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
            }
            ctx.closePath();

            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        };

        // Layer 1: Ungu (Lambat)
        drawAura('rgba(150, 0, 255, 0.5)', 0.5, 1.1 + (kick * 0.2));

        // Layer 2: Cyan (Sedang)
        drawAura('rgba(0, 200, 255, 0.5)', -1.0, 1.05 + (kick * 0.1));

        // Layer 3: Putih (Cepat - Muncul pas Kick)
        if(intensity > 0.2) {
            drawAura('rgba(255, 255, 255, 0.8)', 2.0, 1.2 + (kick * 0.3));
        }

        // --- AVATAR ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            // Clip Blob
            ctx.arc(0, 0, radius, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Ghost Blur (Gambar transparant yang di-scale up)
            if(intensity > 0.3) {
                ctx.globalAlpha = 0.3;
                ctx.scale(1.1, 1.1);
                ctx.drawImage(img, -radius, -radius, size, size);
            }
            ctx.restore();
        }
        ctx.restore();
    });
}