FROM docker:20.10.12-dind-alpine3.14

WORKDIR /src
COPY src/e2e/ ./e2e/
COPY . ./mute/
COPY src/e2e/scripts/start-mute-sigver-containers.sh ./mute/
RUN apk add --upgrade nodejs npm bash
RUN apk add firefox
RUN apk add chromium

WORKDIR /src/e2e
RUN npm ci --no-audit

WORKDIR /app/mute