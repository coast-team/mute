#!/bin/bash
#This script handles the creation of the containers inside an existing docker container. It starts Mute and Sigver.

docker build -f Dockerfile -t mute .
docker run -d -p 4200:4200 --name mute mute 

docker build -f DockerfileSigver -t sigver .
docker run -d -p 8010:8010 --name sigver sigver 