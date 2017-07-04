module.exports = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{eot,ttf,woff,woff2,scss,txt,png,xml,ico,svg,js,html,json,css}"
  ],
  "swDest": "./dist/service-worker.js",
  "globIgnores": [
    "../workbox-cli-config.js"
  ],
  "skipWaiting": true,
  "navigateFallback": [
    "/index.html"
  ]
};
