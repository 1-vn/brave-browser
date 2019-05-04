const config = require('../lib/config')
const util = require('../lib/util')
const {onevnTopLevelPaths} = require('./l10nUtil')

const pullL10n = (options) => {
  onevnTopLevelPaths.forEach((sourceStringPath) => {
    const cmdOptions = config.defaultOptions
    cmdOptions.cwd = config.projects['onevn-core'].dir
    util.run('python', ['script/pull-l10n.py', '--source_string_path', sourceStringPath], cmdOptions)
  })
}

module.exports = pullL10n
