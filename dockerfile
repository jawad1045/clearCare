FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]