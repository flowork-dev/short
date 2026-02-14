if(window.AvatarManager) {
    window.AvatarManager.register('retro', 'Retrowave Sun', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- GRID BACKGROUND (Garis Horisontal neon di belakang) ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(-radius*1.5, 0, size*1.5, radius*1.5); // Area bawah
        ctx.clip();

        ctx.strokeStyle = "rgba(200, 0, 255, 0.5)";
        ctx.lineWidth = 1;
        // Grid bergerak ke bawah (perspektif jalan)
        const gridOffset = (time * 50) % 20;
        for(let i=0; i<size; i+=10) {
            ctx.beginPath();
            // Garis horizontal
            ctx.moveTo(-radius*1.5, i + gridOffset);
            ctx.lineTo(radius*1.5, i + gridOffset);
            ctx.stroke();

            // Garis vertikal (perspektif)
            ctx.beginPath();
            ctx.moveTo(i - radius, 0);
            ctx.lineTo((i - radius) * 2, radius*1.5);
            ctx.stroke();
        }
        ctx.restore();

        // --- AVATAR (THE SUN) ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI*2);
            ctx.clip();

            // Gambar Avatar
            ctx.drawImage(img, -radius, -radius, size, size);

            // --- SUNSET GRADIENT OVERLAY ---
            // Gradasi Kuning ke Pink (Khas Synthwave)
            const grad = ctx.createLinearGradient(0, -radius, 0, radius);
            grad.addColorStop(0, "rgba(255, 255, 0, 0.2)"); // Kuning atas
            grad.addColorStop(1, "rgba(255, 0, 128, 0.6)"); // Pink bawah
            ctx.fillStyle = grad;
            ctx.fill();

            // --- HORIZONTAL STRIPES (Pemotong Matahari) ---
            // Garis hitam yang diam di bawah, bikin efek matahari 80an
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            for(let i=0; i<6; i++) {
                const h = 2 + i; // Makin bawah makin tebal
                const yPos = (radius * 0.2) + (i * 10);
                ctx.fillRect(-radius, yPos, size, h);
            }

            ctx.restore();

            // Glow Luar Matahari
            ctx.shadowBlur = 20 + (kick * 40);
            ctx.shadowColor = "#ff0080";
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI*2);
            ctx.strokeStyle = "rgba(255, 200, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    });
}