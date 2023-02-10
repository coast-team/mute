#!/bin/env bash
#Function to get javascript assets
set -e

function get_url() {
  if test -f "$2"; then
    echo "$2: file exists."
    return
  fi

  wget -O $2 $1
}

##
# Here we need JIO (https://jio.nexedi.com/) for storage function, and JIO requires a specific library for its custom Promises: RSVP
# JIO doesn't provide a version with its non-node code in its npmjs release
##
get_url https://lab.nexedi.com/nexedi/jio/raw/master/dist/jio-v3.45.0.js?inline=false src/assets/jio-latest.js
get_url https://lab.nexedi.com/nexedi/rsvp.js/raw/master/dist/rsvp-2.0.4.min.js?inline=false src/assets/rsvp-2.0.4.min.js