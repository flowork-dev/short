if(window.AvatarManager) {
    window.AvatarManager.register('poly', 'Sacred Geometry', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // Helper bikin polygon
        const drawPoly = (sides, r, rot, color, width) => {
            ctx.save();
            ctx.rotate(rot);
            ctx.beginPath();
            ctx.moveTo(r * Math.cos(0), r * Math.sin(0));
            for (let i = 1; i <= sides; i++) {
                ctx.lineTo(r * Math.cos(i * 2 * Math.PI / sides), r * Math.sin(i * 2 * Math.PI / sides));
            }
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
            ctx.restore();
        };

        // Segitiga 1 (Muter Kanan)
        const rPoly = radius + 10 + (kick * 20);
        drawPoly(3, rPoly, time, '#00ffcc', 2);

        // Segitiga 2 (Muter Kiri - Terbalik)
        drawPoly(3, rPoly, -time + Math.PI, '#ff00cc', 2);

        // Hexagon Luar (Penyatu)
        if(intensity > 0.3) {
            drawPoly(6, rPoly + 10, time * 0.5, '#fff', 1);
        }

        // Avatar Core (Hexagon Clip)
        if(img) {
            ctx.save();
            ctx.beginPath();
            // Clip bentuk Hexagon
            for (let i = 0; i < 6; i++) {
                const angle = i * 2 * Math.PI / 6;
                const px = radius * Math.cos(angle);
                const py = radius * Math.sin(angle);
                if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);

            // Overlay Lines
            if(intensity > 0.5) {
                ctx.strokeStyle = "rgba(255,255,255,0.5)";
                ctx.lineWidth = 1;
                ctx.stroke(); // Outline hexagon
            }
            ctx.restore();
        }
        ctx.restore();
    });
}