FROM node:10-alpine

RUN mkdir -p /app/node_modules

COPY src/package.json ./
RUN npm install

COPY ./src .

CMD ["node", "index.js"]