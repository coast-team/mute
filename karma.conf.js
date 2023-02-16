// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  karmaConfig = {
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    files: [],
    preprocessors: {},
    mime: {
      'text/x-typescript': ['ts', 'tsx'],
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true,
    },
    angularCli: {
      environment: 'dev',
    },
    reporters: config.angularCli && config.angularCli.codeCoverage ? ['progress', 'coverage-istanbul'] : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'ChromeHeadless', 'ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        displayName: 'Chrome',
        base: 'ChromeHeadless',
        // chrome cannot run in sandboxed mode inside a docker container unless it is run with
        // escalated kernel privileges (e.g. docker run --cap-add=CAP_SYS_ADMIN)
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
  }

  if (process.env.CI) {
    karmaConfig.reporters = ['progress', 'junit']
    karmaConfig.junitReporter = {
      outputFile: 'karma.xml',
      useBrowserName: false,
    }
  }

  config.set(karmaConfig)
}
