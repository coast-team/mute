FROM nginx:alpine

LABEL maintainer="Gerald Oster <gerald.oster@loria.fr>"
LABEL org.opencontainers.title coast-team/mute
LABEL org.opencontainers.description a scalable collaborative document editor with CRDT, P2P and E2EE
LABEL org.opencontainers.authors https://github.com/coast-team/mute/graphs/contributors
LABEL org.opencontainers.source https://github.com/coast-team/mute
LABEL org.opencontainers.documentation https://github.com/coast-team/mute/wiki
LABEL org.opencontainers.image.vendor COAST

COPY conf/nginx/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx/nginx.ssl.conf /etc/nginx/nginx.ssl.conf
COPY conf/nginx/nginx.mimetypes.conf /etc/nginx/nginx.mimetypes.conf
COPY ./dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]