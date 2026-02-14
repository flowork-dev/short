if(window.AvatarManager) {
    window.AvatarManager.register('vinyl', 'DJ Vinyl', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 0.8;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- PIRINGAN HITAM (SPINNING) ---
        ctx.save();
        // Muter terus + ngebut pas kick (Scratch effect)
        const spin = time + (kick * 5);
        ctx.rotate(spin);

        // Piringan Luar
        ctx.beginPath();
        ctx.arc(0, 0, radius + 15, 0, Math.PI*2);
        ctx.fillStyle = '#111'; // Hitam pekat
        ctx.fill();

        // Alur/Grooves (Garis abu-abu melingkar)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for(let i=radius; i<radius+15; i+=3) {
            ctx.beginPath();
            ctx.arc(0, 0, i, 0, Math.PI*2);
            ctx.stroke();
        }

        // Flash Putih di alur pas Kick (Pantulan cahaya)
        if(intensity > 0.4) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.5})`;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 10, 0.5, 2); // Kilatan cahaya sebagian
            ctx.stroke();
        }

        // Avatar sebagai Label Tengah
        if(img) {
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(img, -radius, -radius, size, size);
        }
        ctx.restore();

        // --- VISUALIZER NEEDLE (Jarum) ---
        // Jarum gerak kiri-kanan sesuai volume
        ctx.save();
        const needleAngle = -0.5 + (intensity * 0.5); // Gerak dari -0.5 rad ke arah 0
        ctx.rotate(needleAngle);

        // Batang Jarum
        ctx.fillStyle = '#aaa';
        ctx.fillRect(radius, -2, 40, 4);
        // Kepala Jarum
        ctx.fillStyle = 'red';
        ctx.fillRect(radius, -4, 10, 8);

        ctx.restore();

        // Note musik melayang
        if(intensity > 0.2) {
            const noteY = -radius - 20 - (kick * 30);
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText("♪", 20, noteY);
            ctx.fillText("♫", -20, noteY + 10);
        }

        ctx.restore();
    });
}