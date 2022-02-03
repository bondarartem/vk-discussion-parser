FROM node:latest

RUN mkdir /app
WORKDIR /app

COPY src/package.json ./
RUN npm install
COPY ./src /app

CMD ["npm", "start"]