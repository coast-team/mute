#!/bin/env bash
set -e

node scripts/update-app-data.js
git add ngsw-config.json src/app-data.ts