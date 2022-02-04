FROM node:latest as build
WORKDIR /app
COPY ./src/package.json ./src/index.js ./
RUN npm install

FROM node:alpine
COPY --from=build /app /
EXPOSE 3000
CMD ["npm", "start"]