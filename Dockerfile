#Mute build
FROM node:14-alpine AS builder

WORKDIR /app
# Copying only necessary files for the build. 
#(.dockerignore file contains the files or folder to exclude from the COPY statement)
COPY . ./
RUN apk add --no-cache git
RUN apk add --no-cache bash
RUN npm ci
RUN npm run build

#Launch Mute
FROM nginx:alpine

LABEL maintainer="Baptiste Hubert <baptiste.hubert@inria.fr>"
LABEL org.opencontainers.title coast-team/mute
LABEL org.opencontainers.description a scalable collaborative document editor with CRDT, P2P and E2EE
LABEL org.opencontainers.authors https://github.com/coast-team/mute/graphs/contributors
LABEL org.opencontainers.source https://github.com/coast-team/mute
LABEL org.opencontainers.documentation https://github.com/coast-team/mute/wiki
LABEL org.opencontainers.image.vendor COAST

COPY conf/nginx/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx/nginx.ssl.conf /etc/nginx/nginx.ssl.conf
COPY conf/nginx/nginx.mimetypes.conf /etc/nginx/nginx.mimetypes.conf
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]