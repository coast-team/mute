const fs = require('fs')
const childProcess = require('child_process')
const swConfigFileName = './ngsw-config.json'
const swConfig = require(swConfigFileName)
const appDataFileName = './src/app-data.ts'
let appData = fs.readFileSync(appDataFileName, 'utf8')

// Read data from git
let version = childProcess
  .execSync('git describe --abbrev=0 --tags')
  .toString()
  .trim()
if (version !== '' && version[0] === 'v') {
  version = version.substr(1)
}

const commit = childProcess
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()

// Updata appData in the Service Worker
swConfig.appData.commit = commit
swConfig.appData.version = version
fs.writeFile(swConfigFileName, JSON.stringify(swConfig), function(err) {
  if (err) {
    return console.log(err)
  }
  console.log(`${swConfigFileName} has been updated`)
})

// Update appData in app-data.ts file
appData = appData.replace(/version: '.*'/, `version: '${version}'`)
appData = appData.replace(/commit: '.*'/, `commit: '${commit}'`)
fs.writeFile(appDataFileName, appData, function(err) {
  if (err) {
    return console.log(err)
  }
  console.log(`${appDataFileName} has been updated`)
})
