# BUILD STAGE

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev


# RUN STAGE

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package*.json ./

# RUN npm ci --only=production
RUN npm ci --omit=dev

EXPOSE 4004

CMD ["npm", "run", "start"]