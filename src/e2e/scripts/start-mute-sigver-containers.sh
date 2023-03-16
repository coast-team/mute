#!/bin/bash
# This script handles the creation of the containers inside an existing docker container. It starts Mute and Sigver.

docker build -f Dockerfile --build-arg BUILD_TARGET=:dev -t mute .
docker run -d -p 4200:4200 --name mute mute 
docker run -d -p 8010:8010 --name sigver registry.gitlab.inria.fr/coast-team/mute/mute/sigver