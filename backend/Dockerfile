FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libcurl4 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]