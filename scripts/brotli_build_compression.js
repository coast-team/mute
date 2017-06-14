const spawn = require( 'child_process' ).spawn
let brotliCmd = process.argv[2]
if (!brotliCmd) {
  brotliCmd = '/usr/local/bin/bro'
}
const files = [
  'index.html',
  'inline.bundle.js',
  'main.bundle.js',
  'polyfills.bundle.js',
  'scripts.bundle.js',
  'vendor.bundle.js',
  'styles.bundle.css'
]

files.forEach((file) => {
  const bro = spawn(brotliCmd, ['--input', `dist/${file}`, '--output', `dist/${file}.br`])
  bro.stdout.on('data', data => console.log(`${file}: ${data}`))
  bro.stderr.on( 'data', data => console.log(`${file} ERROR with Brotli compression: ${data}`))
  bro.on( 'close', code => {
    if (code === 0) {
      console.log(`${file}: compressed with Brotli ✓`)
    }
  })
})
