#!/bin/env bash
set -e

node scripts/update-app-data.js
node_modules/.bin/prettier --write --list-different ngsw-config.json
git add ngsw-config.json src/app-data.ts