#!/bin/env bash
set -e

function get_url() {
  if test -f "$2"; then
    echo "$2: file exists."
    return
  fi

  wget -O $2 $1
}

get_url https://lab.nexedi.com/nexedi/jio/raw/master/dist/jio-v3.42.0.js?inline=false src/assets/jio-latest.js
get_url https://lab.nexedi.com/nexedi/rsvp.js/raw/master/dist/rsvp-2.0.4.min.js?inline=false src/assets/rsvp-2.0.4.min.js