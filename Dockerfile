FROM node:alpine as build
WORKDIR /app
COPY ./src ./
RUN npm install

FROM gcr.io/distroless/nodejs
COPY --from=build /app /app
