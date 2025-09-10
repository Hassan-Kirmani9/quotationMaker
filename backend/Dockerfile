# syntax = docker/dockerfile:1

ARG NODE_VERSION=18.16.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

WORKDIR /app

ENV NODE_ENV=production

# Install Chromium for Puppeteer
RUN apt-get update -qq && \
    apt-get install -y \
    chromium \
    python-is-python3 \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

FROM base as build

COPY --link package.json package-lock.json .
RUN npm install --production=false

COPY --link . .

RUN npm prune --production

FROM base

COPY --from=build /app /app

EXPOSE 8080

CMD [ "node", "server.js" ]