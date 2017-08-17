module.exports = {
  'globDirectory': 'dist/',
  'globPatterns': ['**\/*.{woff,woff2,js,html,css,json,jpg,jpeg,png,ico,svg}'],
  'swDest': 'dist/service-worker.js',
  'skipWaiting': false,
  'navigateFallback': '/index.html',
  'maximumFileSizeToCacheInBytes': 4000000
}
