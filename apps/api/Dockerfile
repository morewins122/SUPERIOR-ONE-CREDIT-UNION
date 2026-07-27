FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm install

COPY . .
RUN npm run prisma:generate --workspace superior-one-api
RUN npm run build --workspace superior-one-api

EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "superior-one-api"]
