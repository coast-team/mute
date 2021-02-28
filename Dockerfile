FROM nginx:alpine

LABEL maintainer="Gerald Oster <gerald.oster@loria.fr>"

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx.ssl.conf /etc/nginx/nginx.ssl.conf
COPY conf/nginx.mimetypes.conf /etc/nginx/nginx.mimetypes.conf
COPY ./dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]