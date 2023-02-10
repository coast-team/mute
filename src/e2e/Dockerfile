FROM docker:20.10.12-dind-alpine3.14

WORKDIR /app
COPY src/e2e/ ./ci/
COPY . ./mute/
COPY src/e2e/scripts/start-mute-sigver-containers.sh ./mute/
RUN apk add --upgrade nodejs npm bash
RUN apk add firefox
RUN apk add chromium

WORKDIR /app/ci
RUN npm ci

WORKDIR /app/mute