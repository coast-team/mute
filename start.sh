#!/bin/bash

pm2 startOrReload processDocker.yml &
nginx -g "daemon off;"