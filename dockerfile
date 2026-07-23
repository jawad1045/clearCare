FROM node:24-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy project
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]