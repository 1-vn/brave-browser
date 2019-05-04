const path = require('path')
const fs = require('fs-extra')
const ip = require('ip')
const URL = require('url').URL
const config = require('../lib/config')
const util = require('../lib/util')
const whitelistedUrlPrefixes = require('./whitelistedUrlPrefixes')
const whitelistedUrlPatterns = require('./whitelistedUrlPatterns')

const start = (passthroughArgs, buildConfig = config.defaultBuildConfig, options) => {
  config.buildConfig = buildConfig
  config.update(options)

  let onevnArgs = [
    '--enable-logging',
    '--v=' + options.v,
  ]
  if (options.vmodule) {
    onevnArgs.push('--vmodule=' + options.vmodule);
  }
  if (options.no_sandbox) {
    onevnArgs.push('--no-sandbox')
  }
  if (options.disable_onevn_extension) {
    onevnArgs.push('--disable-onevn-extension')
  }
  if (options.disable_onevn_rewards_extension) {
    onevnArgs.push('--disable-onevn-rewards-extension')
  }
  if (options.disable_pdfjs_extension) {
    onevnArgs.push('--disable-pdfjs-extension')
  }
  if (options.disable_webtorrent_extension) {
    onevnArgs.push('--disable-webtorrent-extension')
  }
  if (options.ui_mode) {
    onevnArgs.push(`--ui-mode=${options.ui_mode}`)
  }
  if (!options.enable_onevn_update) {
    // This only has meaning with MacOS and official build.
    onevnArgs.push('--disable-onevn-update')
  }
  if (options.enable_smart_tracking_protection) {
    onevnArgs.push('--enable-smart-tracking-protection')
  }
  if (options.single_process) {
    onevnArgs.push('--single-process')
  }
  if (options.show_component_extensions) {
    onevnArgs.push('--show-component-extension-options')
  }
  if (options.rewards) {
    onevnArgs.push(`--rewards=${options.rewards}`)
  }
  if (options.onevn_ads_testing) {
    onevnArgs.push('--onevn-ads-testing')
  }
  if (options.onevn_ads_debug) {
    onevnArgs.push('--onevn-ads-debug')
  }
  if (options.onevn_ads_production) {
    onevnArgs.push('--onevn-ads-production')
  }
  if (options.onevn_ads_staging) {
    onevnArgs.push('--onevn-ads-staging')
  }
  onevnArgs = onevnArgs.concat(passthroughArgs)

  let user_data_dir
  if (options.user_data_dir_name) {
    if (process.platform === 'darwin') {
      user_data_dir = path.join(process.env.HOME, 'Library', 'Application\\ Support', '1-VNBrowser', options.user_data_dir_name)
    } else if (process.platform === 'win32') {
      user_data_dir = path.join(process.env.LocalAppData, '1-VNBrowser', options.user_data_dir_name)
    } else {
      user_data_dir = path.join(process.env.HOME, '.config', '1-VNBrowser', options.user_data_dir_name)
    }
    onevnArgs.push('--user-data-dir=' + user_data_dir);
  }
  const networkLogFile = path.resolve(path.join(__dirname, '..', 'network_log.json'))
  if (options.network_log) {
    onevnArgs.push(`--log-net-log=${networkLogFile}`)
    onevnArgs.push(`--net-log-capture-mode=IncludeSocketBytes`)
    if (user_data_dir) {
      // clear the data directory before doing a network test
      fs.removeSync(user_data_dir.replace('\\', ''))
      if (fs.existsSync(networkLogFile)) {
        fs.unlinkSync(networkLogFile)
      }
      if (fs.existsSync('network-audit-results.json')) {
        fs.unlinkSync('network-audit-results.json')
      }
    }
  }

  let cmdOptions = {
    stdio: 'inherit',
    timeout: options.network_log ? 120000 : undefined,
    continueOnFail: options.network_log ? true : false,
    shell: process.platform === 'darwin' ? true : false,
    killSignal: options.network_log && process.env.RELEASE_TYPE ? 'SIGKILL' : 'SIGTERM'
  }

  if (options.network_log) {
    console.log('Network audit started. Logging requests for the next 2min or until you quit OneVN...')
  }

  let outputPath = options.output_path
  if (!outputPath) {
    if (process.platform === 'darwin') {
      let outputDir = config.outputDir
      if (config.shouldSign()) {
        outputDir = path.join(outputDir, config.mac_signing_output_prefix)
      }
      outputPath = path.join(outputDir,
                             'OneVN\\ Browser\\ Development.app', 'Contents', 'MacOS',
                             'OneVN\\ Browser\\ Development')
    } else if (process.platform === 'win32') {
      outputPath = path.join(config.outputDir, 'one.exe')
    } else {
      outputPath = path.join(config.outputDir, 'onevn')
    }
  }
  util.run(outputPath, onevnArgs, cmdOptions)

  if (options.network_log) {
    let exitCode = 0
    let jsonOutput = {}
    // Read the network log
    let jsonContent = fs.readFileSync(networkLogFile, 'utf8').trim()
    // On windows netlog ends abruptly causing JSON parsing errors
    if (!jsonContent.endsWith('}]}')) {
      const n = jsonContent.lastIndexOf('},')
      jsonContent = jsonContent.substring(0, n) + "}]}"
    }
    jsonOutput = JSON.parse(jsonContent)

    const URL_REQUEST_TYPE = jsonOutput.constants.logSourceType.URL_REQUEST
    const URL_REQUEST_FAKE_RESPONSE_HEADERS_CREATED = jsonOutput.constants.logEventTypes.URL_REQUEST_FAKE_RESPONSE_HEADERS_CREATED
    const urlRequests = jsonOutput.events.filter((event) => {
      if (event.type === URL_REQUEST_FAKE_RESPONSE_HEADERS_CREATED) {
        // showing these helps determine which URL requests which don't
        // actually hit the network
        return true
      }
      if (event.source.type === URL_REQUEST_TYPE) {
        if (!event.params) {
          return false
        }
        const url = event.params.url
        if (!url) {
          return false
        }
        if (url.startsWith('http') && url.includes('.')) {
          const foundPrefix = whitelistedUrlPrefixes.find((prefix) => {
            return url.startsWith(prefix)
          })
          const foundPattern = whitelistedUrlPatterns.find((pattern) => {
            return RegExp('^' + pattern).test(url)
          })
          if (!foundPrefix && !foundPattern) {
            // Check if the URL is a private IP
            try {
              const hostname = new URL(url).hostname
              if (ip.isPrivate(hostname)) {
                // Warn but don't fail the audit
                console.log('NETWORK AUDIT WARN:', url)
                return true
              }
            } catch (e) {}
            // This is not a whitelisted URL! log it and exit with non-zero
            console.log('NETWORK AUDIT FAIL:', url)
            exitCode = 1
          }
          return true
        }
      }
      return false
    })
    fs.writeJsonSync('network-audit-results.json', urlRequests)
    if (exitCode > 0) {
      console.log(`network-audit failed. import ${networkLogFile} in chrome://net-internals for more details.`)
    } else {
      console.log('network audit passed.')
    }
    process.exit(exitCode)
  }
}

module.exports = start
