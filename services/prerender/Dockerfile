FROM node:23-alpine

ENV DISPLAY :99.0

WORKDIR /app

# Installs latest Chromium package.
RUN apk upgrade --no-cache --available \
    && apk add --no-cache \
      chromium \
      #ttf-freefont \
      #font-noto-emoji \
    && apk add --no-cache \
      --repository=https://dl-cdn.alpinelinux.org/alpine/edge/testing

COPY . /app

RUN npm install --no-audit --progress=false

RUN addgroup -S prerender && adduser -S -g prerender prerender
USER prerender

EXPOSE 3000

CMD [ "node", "server.js" ]
