if(window.AvatarManager) {
    window.AvatarManager.register('anime_ninja', 'Ninja Eye', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const radius = size / 2;

        const intensity = volume / 255;
        const kick = Math.pow(intensity, 2) * 1.0;
        const pulse = 1 + kick;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        // --- 1. CHAKRA ENERGY (Luar) ---
        // Putaran Chakra Ungu/Biru
        ctx.save();
        ctx.rotate(-time * 2);
        ctx.beginPath();
        // Bikin bentuk blob chakra
        for(let i=0; i<=Math.PI*2; i+=0.2) {
            const r = radius + 15 + (Math.sin(i*5 + time*10) * 5) + (kick * 20);
            ctx.lineTo(Math.cos(i)*r, Math.sin(i)*r);
        }
        ctx.fillStyle = `rgba(100, 0, 255, 0.6)`;
        ctx.fill();
        ctx.restore();

        // --- 2. EYE BACKGROUND (Merah) ---
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI*2);
        ctx.fillStyle = "#aa0000"; // Merah darah
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- 3. TOMOE (Pattern Mata Muter) ---
        ctx.save();
        // Speed muter naik drastis pas ngomong
        const spinSpeed = time + (kick * 10);
        ctx.rotate(spinSpeed);

        const tomoeCount = 3;
        for(let i=0; i<tomoeCount; i++) {
            ctx.save();
            ctx.rotate((Math.PI*2 / tomoeCount) * i);
            ctx.translate(radius * 0.6, 0);

            // Gambar Tomoe (Lingkaran hitam kecil + ekor)
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.08, 0, Math.PI*2);
            ctx.fillStyle = "black";
            ctx.fill();
            // Ekor tomoe
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(10, 10, 0, 20);
            ctx.stroke();

            ctx.restore();
        }
        ctx.restore();

        // --- 4. AVATAR (Pupil Tengah) ---
        if(img) {
            ctx.save();
            ctx.beginPath();
            // Avatar di tengah sebagai pupil
            ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -radius*0.5, -radius*0.5, size*0.5, size*0.5);
            ctx.restore();

            // Ring Pupil
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.5, 0, Math.PI*2);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    });
}