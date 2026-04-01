FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["./docker-entrypoint.sh"]
