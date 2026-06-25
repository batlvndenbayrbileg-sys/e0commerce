# Medusa v2 backend — deploy to Railway / Render (with managed Postgres + Redis).
# Build context = this apps/backend directory.
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 9000

# Run pending migrations, then start the compiled server.
CMD ["sh", "-c", "npx medusa db:migrate && cd .medusa/server && npm install --omit=dev --legacy-peer-deps && npm run start"]
