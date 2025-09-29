FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Debug: Show what we copied
RUN echo "=== Source files ===" && ls -la src/

# Debug: Show tsconfig
RUN echo "=== tsconfig.json ===" && cat tsconfig.json

# Build with verbose output
RUN echo "=== Building ===" && npm run build

# Debug: Show build output
RUN echo "=== Build output ===" && ls -la dist/ 2>/dev/null || echo "No dist directory found"

# Debug: Show if server.js exists
RUN test -f dist/server.js && echo "server.js found" || echo "server.js NOT found"

EXPOSE 5000
CMD ["npm", "start"]