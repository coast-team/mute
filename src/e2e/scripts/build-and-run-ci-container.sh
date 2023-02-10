#!/bin/bash
#This script handles the creation of docker container that will contain the subsequent docker containers

imageName=$1
containerName=$2
pathToTest="src/e2e/Dockerfile"

docker build -f $pathToTest -t $imageName --no-cache . 
docker run --privileged -d --name $containerName $imageName