##
# Docker Build: docker build . -t dbe-admin
# Docker Run: docker run -p 3000:8080 dbe-admin
# Docker PS: docker ps | grep dbe-admin
# Docker Stop: docker stop IMAGE_ID
##

# Install dependencies only when needed
FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json ./

RUN npm i -f

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG REACT_APP_API_URL
ARG REACT_APP_XRPL_EXPLORER
ARG FRONTEND_URL
ENV NODE_ENV production

RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

COPY server/package*.json ./
RUN npm i -f
COPY server/app.js ./
COPY --from=builder /app/build ./public

ENV NODE_ENV production

EXPOSE 8080

ENV PORT 8080

CMD ["node", "app.js"]
