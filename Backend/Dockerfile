FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD npx prisma db push --accept-data-loss && node prisma/seed.js && node src/server.js
