// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
const { SpecReporter } = require('jasmine-spec-reporter')

exports.config = {
  allScriptsTimeout: 11000,

  // Spec patterns are relative to the current working directory when
  // protractor is called.
  specs: [
    'src/e2e/**/*.e2e-spec.ts'
  ],

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [ "--headless", "--disable-gpu", "--no-sandbox"]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',

  SELENIUM_PROMISE_MANAGER: false,

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },

  onPrepare() {
    require('ts-node').register({
      project: 'src/e2e/tsconfig.e2e.json'
    })
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: 'raw'
      }
    }))
  }
}
