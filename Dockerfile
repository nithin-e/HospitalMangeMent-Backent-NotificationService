FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN mkdir -p dist/proto && cp -r src/proto/* dist/proto/


# Build TypeScript
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]


    
