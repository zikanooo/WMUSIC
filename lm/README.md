# Liquid Music (Vite + React + Express)
## Lokal
    npm install
    # wajib untuk pemutaran andal: pasang yt-dlp  (pipx install yt-dlp / brew install yt-dlp / winget install yt-dlp)
    npm run dev          # buka http://localhost:5173 (API di :3001)
## Produksi / VPS
    npm run build && npm start        # satu server di :3001 (API + dist)
    docker build -t liquid-music . && docker run -d -p 3000:3000 --restart unless-stopped liquid-music
HTTPS wajib agar bisa di-install sebagai PWA (Caddy/Nginx di depan).
## Deploy di Vercel
Backend jalan sebagai function (api/index.ts, wilayah Singapura). yt-dlp tidak ada di Vercel, jadi audio memakai youtubei.js; bila YouTube memblokir IP Vercel, host backend di VPS/Docker.

## Jika lagu gagal diputar
1. Cek `http://localhost:3001/api/stream/<videoId>` — pesan error muncul di sana, log server juga mencatat `[yt-dlp gagal]`.
2. Update yt-dlp (`yt-dlp -U`). 3. IP datacenter sering kena bot-check: ekspor cookies.txt lalu set `YTDLP_COOKIES=/path/cookies.txt`.
## Ganti sumber musik
Sumber ada di server/youtube.ts (data) dan server/stream.ts (audio); ganti dua file itu untuk Audius/Jamendo.
