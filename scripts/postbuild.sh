#!/bin/env bash
set -e

if ! command -v zopfli &> /dev/null
then
  echo "zopfli could not be found on your system. Skipping asset compression."
else
  zopfli dist/*.js dist/*.css dist/*.html
fi
