const fs = require('fs')
const childProcess = require('child_process')
const fileName = './ngsw-config.json'
const file = require(fileName)

file.appData.commit = childProcess
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()

file.appData.version = childProcess
  .execSync('git describe --abbrev=0 --tags')
  .toString()
  .trim()

fs.writeFile(fileName, JSON.stringify(file), function(err) {
  if (err) {
    return console.log(err)
  }
  console.log(`${fileName} has been updated`)
})
