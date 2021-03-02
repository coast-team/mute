#!/bin/env bash
set -e

name=$1
version=$2

mkdir -p releases
tar cf - dist/ | xz -z - > releases/${name}-${version}.tar.xz
gpg2 --batch --yes --output releases/${name}-${version}.tar.xz.asc --digest-algo SHA512 --armor --detach-sig releases/${name}-${version}.tar.xz
