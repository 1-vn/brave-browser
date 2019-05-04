/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path')
const fs = require('fs')
const util = require('../lib/util')

const baseDir = path.resolve(path.join(__dirname, '..'))
const onevnDir = path.join(baseDir, 'src', 'onevn')
const onevnVendorDir = path.join(onevnDir, 'vendor')
const syncDir = path.join(onevnDir, 'components', 'onevn_sync', 'extension')

/**
 * Runs npm audit on a given directory located at pathname
 */
function npmAudit (pathname) {
  if (fs.existsSync(path.join(pathname, 'package.json')) &&
    fs.existsSync(path.join(pathname, 'package-lock.json')) &&
    fs.existsSync(path.join(pathname, 'node_modules'))) {
    console.log('Auditing', pathname)
    let cmdOptions = {
      cwd: pathname,
      shell: process.platform === 'win32' ? true : false
    }
    util.run('npm', ['audit'], cmdOptions)
  } else {
    console.log('Skipping audit of "' + pathname + '" (no package.json or node_modules directory found)')
  }
}

npmAudit(baseDir)
npmAudit(onevnDir)
fs.readdirSync(onevnVendorDir).forEach((dir) => {
  npmAudit(path.join(onevnVendorDir, dir))
})
fs.readdirSync(syncDir).forEach((dir) => {
  npmAudit(path.join(syncDir, dir))
})