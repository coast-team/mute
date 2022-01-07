FROM node:16-alpine

LABEL maintainer="Baptiste Hubert <baptiste.hubert@inria.fr>"
LABEL org.opencontainers.title coast-team/mute
LABEL org.opencontainers.description a scalable collaborative document editor with CRDT, P2P and E2EE
LABEL org.opencontainers.authors https://github.com/coast-team/mute/graphs/contributors
LABEL org.opencontainers.source https://github.com/coast-team/mute
LABEL org.opencontainers.documentation https://github.com/coast-team/mute/wiki
LABEL org.opencontainers.image.vendor COAST

RUN mkdir /Mute
WORKDIR /Mute
COPY . .


RUN npm install
RUN npm run build
EXPOSE 4200
CMD ["npm","start"]




