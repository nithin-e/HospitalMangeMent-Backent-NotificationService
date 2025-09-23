# ----------- Build Stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p dist/proto && cp -r src/proto/* dist/proto/ || true

RUN npm run build


# ----------- Production Stage -----------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files to install only prod dependencies
COPY package*.json ./

RUN npm install --omit=dev

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Copy proto files (in case they are needed at runtime)
COPY --from=builder /app/dist/proto ./dist/proto

EXPOSE 5000

# Debug and start
CMD echo "=== Starting Application ===" && \
    node dist/server.js
