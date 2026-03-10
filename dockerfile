# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for prisma (openssl)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma

# Generate prisma client with correct targets
RUN npx prisma generate

COPY . .
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Solo copiamos lo necesario
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
