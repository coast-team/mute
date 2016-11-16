FROM nginx:alpine
MAINTAINER Gerald Oster <gerald.oster@loria.fr>

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx.mute.default.conf /etc/nginx/conf.d/default.conf

COPY ./dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
