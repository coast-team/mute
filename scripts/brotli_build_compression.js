const spawn = require('child_process').spawn
const fs = require('fs')
let brotliCmd = process.argv[2]
if (!brotliCmd) {
  brotliCmd = '/usr/local/bin/bro'
}

const DIR = '/home/philippe/workspace/mute/dist'

console.log('Brotli is compressing HTML, JS and CSS files...')

fs.readdir(DIR, (err, files) => {
  if (err) {
    console.error('Could not list the directory.', err)
    process.exit(1)
  }

  const compressedFilesPromises = []

  files.forEach((file) => {
    if (file.match(/^.*\.(html|js|css)$/)) {
      compressedFilesPromises.push(
        new Promise((resolve, reject) => {
          const bro = spawn(brotliCmd, ['--input', `dist/${file}`, '--output', `dist/${file}.br`])

          bro.on('close', (code) => {
            if (code === 0) {
              resolve(file)
            } else {
              reject(`Failed to compressed ${file} file`)
            }
          })
          bro.stdout.on('data', (data) => console.log(`${file}: ${data}`))
          bro.stderr.on('data', (data) => reject(`${file} ERROR with Brotli compression: ${data}`))
        })
      )
    }
  })

  Promise.all(compressedFilesPromises)
    .then((files) => console.log('Compressed with Brotli ✓: ', files.toString()))
    .catch((reason) => console.error('Compression FAILED: ' + reason))
})
