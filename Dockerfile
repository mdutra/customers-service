# Stage 1

FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2

FROM node:16-alpine

WORKDIR /app

COPY package*.json .env ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV REDIS_HOST=redis-1686658208705
ENV REDIS_PORT=6379

CMD [ "node", "dist/main.js" ]
