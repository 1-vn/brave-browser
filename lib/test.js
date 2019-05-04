const path = require('path')

const config = require('../lib/config')
const util = require('../lib/util')

const test = (suite, buildConfig = config.defaultBuildConfig, options) => {
  config.buildConfig = buildConfig
  config.update(options)

  const onevnArgs = [
    '--enable-logging',
    '--v=' + options.v,
  ]

  if (options.filter) {
    onevnArgs.push('--gtest_filter=' + options.filter)
  }

  if (options.output) {
    onevnArgs.push('--gtest_output=xml:' + options.output)
  }

  if (options.disable_onevn_extension) {
    onevnArgs.push('--disable-onevn-extension')
  }

  if (options.single_process) {
    onevnArgs.push('--single_process')
  }

  if (options.test_launcher_jobs) {
    onevnArgs.push('--test-launcher-jobs=' + options.test_launcher_jobs)
  }

  // Build the tests
  util.run('ninja', ['-C', config.outputDir, suite], config.defaultOptions)
  util.run('ninja', ['-C', config.outputDir, "fix_onevn_test_install_name"], config.defaultOptions)

  let testBinary;
  if (process.platform === 'win32') {
    testBinary = `${suite}.exe`
  } else {
    testBinary = suite
  }

  // Run the tests
  util.run(path.join(config.outputDir, testBinary), onevnArgs, config.defaultOptions)
}

module.exports = test
