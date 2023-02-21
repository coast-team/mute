#!/bin/env bash
set -e

trap "rm dist/stats.json" SIGINT

npm run build:stats
npx webpack-bundle-analyzer dist/stats.json