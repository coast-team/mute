const fs = require('fs')
const package = require('./package.json')
const swConfigFileName = './ngsw-config.json'
const swConfig = require(swConfigFileName)
const appDataFileName = './src/app-data.ts'
let appData = fs.readFileSync(appDataFileName, 'utf8')

// Read data from git
let version = package.version
if (version !== '' && version[0] === 'v') {
  version = version.substr(1)
}

// Updata appData in the Service Worker
swConfig.appData.version = version
fs.writeFile(swConfigFileName, JSON.stringify(swConfig), function(err) {
  if (err) {
    return console.log(err)
  }
  console.log(`${swConfigFileName} has been updated`)
})

// Update appData in app-data.ts file
appData = appData.replace(/version: '.*'/, `version: '${version}'`)
fs.writeFile(appDataFileName, appData, function(err) {
  if (err) {
    return console.log(err)
  }
  console.log(`${appDataFileName} has been updated`)
})
