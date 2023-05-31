FROM alpine:3.17

RUN apk add --update nodejs npm

WORKDIR /application

COPY package.json .
COPY package-lock.json .
RUN npm i

COPY . .
RUN npm run build

COPY entrypoint.sh .

ENTRYPOINT ["sh", "entrypoint.sh"]
