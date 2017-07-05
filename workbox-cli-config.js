module.exports = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{eot,ttf,woff,woff2,scss,txt,png,xml,ico,svg,js,html,json,css}"
  ],
  "swDest": "./dist/service-worker.js",
  "globIgnores": [
    "../workbox-cli-config.js"
  ],
  "skipWaiting": false,
  "navigateFallback": [
    "/index.html"
  ],
  "maximumFileSizeToCacheInBytes": 4000000
};
