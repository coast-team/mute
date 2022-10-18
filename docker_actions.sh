#!/bin/bash
#
opt1="start"
opt2="stop"

if [ $1 = $opt1 ]
then
    docker-compose start sigver
fi

if [ $1 = $opt2 ]
then
    docker-compose stop sigver
fi