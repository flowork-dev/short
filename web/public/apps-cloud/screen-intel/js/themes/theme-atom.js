if(window.AvatarManager) {
    window.AvatarManager.register('atom', 'Atomic Core', (ctx, x, y, size, img, volume) => {
        const time = Date.now() / 1000;
        const coreSize = size * 0.5;

        // --- LOGIC DENYUT (KICK) 2X LIPAT ---
        // Kita normalisasi volume jadi 0.0 sampai 1.0
        const intensity = volume / 255;

        // Pangkat 3 biar loncatannya tajam (Exponential Kick)
        // Multiplier 0.8 bikin dia nambah gede hampir 2x lipat dari aslinya
        const kick = Math.pow(intensity, 2) * 0.8;

        // Base pulse (napas) + Kick
        const pulse = 1 + kick + (Math.sin(time * 2) * 0.02);

        // --- 1. ORBIT PATHS (Garis Lintasan) ---
        ctx.save();
        ctx.translate(x, y);

        // Efek Rotasi Keseluruhan (Makin kenceng suara, makin ngebut muternya)
        const rotationSpeed = time * 0.2 + (intensity * 2);
        ctx.rotate(rotationSpeed);

        ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 + intensity})`; // Makin terang pas bass
        ctx.lineWidth = 1 + (intensity * 3); // Garis menebal pas bass

        // Gambar 3 elips
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.rotate(Math.PI / 3);

            // Radius meledak keluar pas ada suara (Explosive Expand)
            const radiusX = (size * 0.8) + (kick * 100);
            const radiusY = (size * 0.3) + (kick * 50);

            ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        // --- 2. ELECTRON PARTICLES (Bola Energik) ---
        ctx.fillStyle = '#00f3ff';
        // Speed elektron naik drastis pas suara masuk
        const electronSpeed = (time * 2) + (intensity * 10);

        for(let i=0; i<3; i++) {
            // Kalkulasi posisi 3D di lintasan elips yang juga meledak
            const currentRadX = (size * 0.8) + (kick * 100);
            const currentRadY = (size * 0.3) + (kick * 50);

            // Logic rotasi manual biar ngikutin orbit yang muter
            const orbitAngle = electronSpeed + (i * (Math.PI * 2 / 3));

            // Transformasi manual koordinat rotasi (karena orbitnya tadi kita rotate di canvas)
            const baseAngle = rotationSpeed + (i * Math.PI / 3); // Sudut dasar orbit

            // Matematika posisi di orbit miring
            // (Disederhanakan biar efek visualnya dapet tapi gak berat itungan)
            const localX = Math.cos(orbitAngle) * currentRadX;
            const localY = Math.sin(orbitAngle) * currentRadY;

            // Putar titik local sesuai sudut orbit
            const finalX = x + (localX * Math.cos(baseAngle) - localY * Math.sin(baseAngle));
            const finalY = y + (localX * Math.sin(baseAngle) + localY * Math.cos(baseAngle));

            ctx.beginPath();
            ctx.arc(finalX, finalY, 5 + (kick * 5), 0, Math.PI*2); // Bola ikut membesar
            ctx.fill();
        }

        // --- 3. AVATAR CORE (Jantung) ---
        if(img) {
            ctx.save();
            ctx.translate(x, y);

            // KUNCI DENYUT: Scale diaplikasikan disini
            ctx.scale(pulse, pulse);

            // Gambar Core
            ctx.beginPath();
            ctx.arc(0, 0, coreSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -coreSize/2, -coreSize/2, coreSize, coreSize);

            // Efek Flash Putih pas Bass Nendang
            if(intensity > 0.6) {
                ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
                ctx.fill();
            }

            ctx.restore();

            // --- 4. RING GLOW (Muter Berlawanan Arah) ---
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(pulse, pulse); // Ring ikut membesar
            ctx.rotate(-time * 2); // Muter lawan arah

            ctx.shadowBlur = 20 + (kick * 50); // Glow meledak
            ctx.shadowColor = "#00f3ff";

            ctx.beginPath();
            // Bikin Ring putus-putus
            ctx.arc(0, 0, (coreSize/2) + 5, 0, Math.PI*2);
            ctx.strokeStyle = "rgba(0, 243, 255, 0.9)";
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 15]); // Putus-putus
            ctx.stroke();

            ctx.restore();
        }
    });
}