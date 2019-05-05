/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */


/**
 * This file manages the following:
 * - Lists of files needed to be translated (Which is all top level GRD and JSON files)
 * - All mappings for auto-generated Onevn files from the associated Chromium files.
 * - Top level global string replacements, such as replacing Chromium with Onevn
 */

const path = require('path')
const fs = require('fs')

const srcDir = path.resolve(path.join(__dirname, '..', 'src'))

// chromium_strings.grd and any of its parts files that we track localization for in transifex
// These map to onevn/app/resources/chromium_strings*.xtb
const chromiumStringsPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'chromium_strings.grd'))
const onevnStringsPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'onevn_strings.grd'))
const chromiumSettingsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'settings_chromium_strings.grdp'))
const onevnSettingsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'settings_onevn_strings.grdp'))

// component_chromium_strings.grd and any of its parts files that we track localization for in transifex
// These map to onevn/app/strings/components_chromium_strings*.xtb
const chromiumComponentsStringsPath = path.resolve(path.join(srcDir, 'components', 'components_chromium_strings.grd'))
const onevnChromiumComponentsStringsPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'components_onevn_strings.grd'))

// generated_resources.grd and any of its parts files that we track localization for in transifex
// There is also chromeos_strings.grdp but we don't need to track it here
// These map to onevn/app/resources/generated_resoruces*.xtb
const chromiumGeneratedResourcesPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'generated_resources.grd'))
const onevnGeneratedResourcesPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'generated_resources.grd'))
const chromiumBookmarksPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'bookmarks_strings.grdp'))
const onevnBookmarksPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'bookmarks_strings.grdp'))
const chromiumMediaRouterPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'media_router_strings.grdp'))
const onevnMediaRouterPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'media_router_strings.grdp'))
const chromiumSettingsStringsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'settings_strings.grdp'))
const onevnSettingsStringsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'settings_strings.grdp'))
const chromiumMdExtensionsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'md_extensions_strings.grdp'))
const onevnMdExtensionsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'md_extensions_strings.grdp'))
const chromiumPrintingStringsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'printing_strings.grdp'))
const onevnPrintingStringsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'printing_strings.grdp'))
const chromiumProfileSettingsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'profiles_strings.grdp'))
const onevnProfileSettingsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'profiles_strings.grdp'))
const chromiumFileManagerStringsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'file_manager_strings.grdp'))
const onevnFileManagerStringsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'file_manager_strings.grdp'))
const chromiumVRStringsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'vr_strings.grdp'))
const onevnVRStringsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'vr_strings.grdp'))
const chromiumOnboardingWelcomeStringsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'onboarding_welcome_strings.grdp'))
const onevnOnboardingWelcomeStringsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'onboarding_welcome_strings.grdp'))
const chromiumAppManagementStringsPartPath = path.resolve(path.join(srcDir, 'chrome', 'app', 'app_management_strings.grdp'))
const onevnAppManagementStringsPartPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'app_management_strings.grdp'))

// The following are not generated files but still need to be tracked so they get sent to transifex
// These xtb files don't need to be copied anywhere.
// onevn_generated_resources.grd maps to onevn/app/resources/onevn_generated_resources*.xtb,
// onevn_components_strings.grd maps to onevn/components/resources/strings/onevn_components_resources*.xtb
// messages.json localization is handled inside of onevn-extension.
const onevnSpecificGeneratedResourcesPath = path.resolve(path.join(srcDir, 'onevn', 'app', 'onevn_generated_resources.grd'))
const onevnComponentsStringsPath = path.resolve(path.join(srcDir, 'onevn', 'components', 'resources', 'onevn_components_strings.grd'))
const onevnExtensionMessagesPath = path.resolve(path.join(srcDir, 'onevn', 'components', 'onevn_extension', 'extension', 'onevn_extension', '_locales', 'en_US', 'messages.json'))
const onevnRewardsExtensionMessagesPath = path.resolve(path.join(srcDir, 'onevn', 'components', 'onevn_rewards', 'resources', 'extension', 'onevn_rewards', '_locales', 'en_US', 'messages.json'))

// When adding new grd or grd files, never add a grdp part path without a parent grd path.
// Group them with a leading and trailing newline to keep this file organized.

// Add all mappings here whether it is a GRD or a GRDP.
// Onevn specific only grd and grdp files should not be added here.
const chromiumToAutoGeneratedOnevnMapping = {
  [chromiumStringsPath]: onevnStringsPath,
  [chromiumSettingsPartPath]: onevnSettingsPartPath,
  [chromiumComponentsStringsPath]: onevnChromiumComponentsStringsPath,
  [chromiumGeneratedResourcesPath]: onevnGeneratedResourcesPath,
  [chromiumBookmarksPartPath]: onevnBookmarksPartPath,
  [chromiumMediaRouterPartPath]: onevnMediaRouterPartPath,
  [chromiumSettingsStringsPartPath]: onevnSettingsStringsPartPath,
  [chromiumMdExtensionsPartPath]: onevnMdExtensionsPartPath,
  [chromiumPrintingStringsPartPath]: onevnPrintingStringsPartPath,
  [chromiumProfileSettingsPartPath]: onevnProfileSettingsPartPath,
  [chromiumFileManagerStringsPartPath]: onevnFileManagerStringsPartPath,
  [chromiumVRStringsPartPath]: onevnVRStringsPartPath,
  [chromiumOnboardingWelcomeStringsPartPath]: onevnOnboardingWelcomeStringsPartPath,
  [chromiumAppManagementStringsPartPath]: onevnAppManagementStringsPartPath
}

// Same as with chromiumToAutoGeneratedOnevnMapping but maps in the opposite direction
module.exports.autoGeneratedOnevnToChromiumMapping = Object.keys(chromiumToAutoGeneratedOnevnMapping)
    .reduce((obj, key) => ({ ...obj, [chromiumToAutoGeneratedOnevnMapping[key]]: key }), {})

// All paths which are not generated
module.exports.onevnNonGeneratedPaths = [
  onevnSpecificGeneratedResourcesPath, onevnComponentsStringsPath, onevnExtensionMessagesPath, onevnRewardsExtensionMessagesPath
]

// All paths which are generated
module.exports.onevnAutoGeneratedPaths = Object.values(chromiumToAutoGeneratedOnevnMapping)

// Onevn specific strings and Chromium mapped Onevn strings will be here.
// But you only need to add the Onevn specific strings manually here.
module.exports.allOnevnPaths = module.exports.onevnNonGeneratedPaths.concat(module.exports.onevnAutoGeneratedPaths)

// Get all GRD and JSON paths whether they are generatd or not
// Push and pull scripts for l10n use this.
// Transifex manages files per grd and not per grd or grdp.
// This is because only 1 xtb is created per grd per locale even if it has multiple grdp files.
module.exports.onevnTopLevelPaths = module.exports.allOnevnPaths.filter((x) => ['grd', 'json'].includes(x.split('.').pop()))


// This simply reads Chromium files that are passed to it and replaces branding strings
// with Onevn specific branding strings.
// Do not use this for filtering XML, instead use chromium-rebase-l10n.py.
// Only add idempotent replacements here (i.e. don't append replace A with AX here)
module.exports.rebaseOnevnStringFilesOnChromiumL10nFiles = async function (path) {
  const ops = Object.entries(chromiumToAutoGeneratedOnevnMapping).map(async ([sourcePath, destPath]) => {
    let contents = await new Promise(resolve => fs.readFile(sourcePath, 'utf8', (err, data) => resolve(data)))
    for (const replacement of defaultReplacements) {
      contents = contents.replace(replacement[0], replacement[1])
    }
    await new Promise(resolve => fs.writeFile(destPath, contents, 'utf8', resolve))
  })
  await Promise.all(ops)
}

// Straight-forward string replacement list.
// Consider mapping chromium resource ID to a new onevn resource ID
// for whole-message replacements, instead of adding to this list.
const defaultReplacements = [
  [/Automatically send usage statistics and crash reports to Google/g, 'Automatically send crash reports to Google'],
  [/Automatically sends usage statistics and crash reports to Google/g, 'Automatically sends crash reports to Google'],
  [/Chrome Web Store/g, 'Web Store'],
  [/The Chromium Authors/g, '1-VN Software Inc'],
  [/Google Chrome/g, '1-VN'],
  [/Chromium/g, '1-VN'],
  [/Chrome/g, '1-VN'],
  [/Google/g, '1-VN'],
  [/You're incognito/g, 'This is a private window'],
  [/an incognito/g, 'a private'],
  [/an Incognito/g, 'a Private'],
  [/incognito/g, 'private'],
  [/Incognito/g, 'Private'],
  [/inco\&amp\;gnito/g, '&amp;private'],
  [/Inco\&amp\;gnito/g, '&amp;Private'],
]
