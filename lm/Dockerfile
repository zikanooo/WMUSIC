FROM node:22-slim AS b
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
# yt-dlp = resolver audio paling andal (sering diperbarui). Update berkala: docker build --no-cache
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates curl ffmpeg \
 && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp \
 && rm -rf /var/lib/apt/lists/*
COPY --from=b /app /app
ENV PORT=3000
EXPOSE 3000
CMD ["npx","tsx","server/index.ts","--prod"]
