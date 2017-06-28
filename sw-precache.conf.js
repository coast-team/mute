module.exports = {
  staticFileGlobs: [
    'dist/*'
  ],
  root: 'dist',
  stripPrefix: 'dist/',
  navigateFallback: '/index.html',
  handler: 'fastest'
}
