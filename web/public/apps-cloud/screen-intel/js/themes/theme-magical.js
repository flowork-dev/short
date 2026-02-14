if(window.AvatarManager) {
    window.AvatarManager.register('anime_magical', 'Magical Prism', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- 1. WINGS (Sayap di belakang) ---
        ctx.save();
        // Sayap "mengepak" pas kick
        const flap = Math.sin(time * 5) * 0.1 + (kick * 0.5);
        ctx.scale(1 + flap, 1); // Stretch horizontal

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "pink";

        // Gambar sayap sederhana
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(radius*2, -radius*1.5, radius*3, -radius*0.5); // Kanan
        ctx.quadraticCurveTo(radius*1.5, 0, 0, radius * 0.5);
        ctx.quadraticCurveTo(-radius*1.5, 0, -radius*3, -radius*0.5); // Kiri
        ctx.quadraticCurveTo(-radius*2, -radius*1.5, 0, 0);
        ctx.fill();
        ctx.restore();

        // --- 2. MAGIC CIRCLE (Renda) ---
        ctx.save();
        ctx.rotate(time * 0.5); // Muter pelan
        ctx.strokeStyle = "pink";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI*2);
        ctx.stroke();

        // Hiasan Loop
        for(let i=0; i<8; i++) {
            ctx.rotate(Math.PI*2 / 8);
            ctx.beginPath();
            ctx.arc(radius + 5, 0, 5, 0, Math.PI*2);
            ctx.stroke();
        }
        ctx.restore();

        // --- 3. SPARKLES (Bintang) ---
        const stars = 5;
        for(let i=0; i<stars; i++) {
            const angle = (time * 0.8) + (i * (Math.PI*2/stars));
            const dist = radius + 20 + (kick * 30);
            const sx = Math.cos(angle) * dist;
            const sy = Math.sin(angle) * dist;

            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI*2);
            ctx.fill();
        }

        // --- 4. AVATAR ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Glitter Overlay
            if(intensity > 0.3) {
                ctx.fillStyle = `rgba(255, 192, 203, ${intensity * 0.3})`;
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    });
}