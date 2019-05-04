// Before adding to this list, get approval from the security team
module.exports = [
  'http://update.googleapis.com/service/update2', // allowed because it 307's to go-updater.1-vn.com. should never actually connect to googleapis.com.
  'https://update.googleapis.com/service/update2', // allowed because it 307's to go-updater.1-vn.com. should never actually connect to googleapis.com.
  'https://safebrowsing.googleapis.com/v4/threatListUpdates', // allowed because it 307's to safebrowsing.1-vn.com
  'https://clients2.googleusercontent.com/crx/blobs/',
  'http://dl.google.com/release2/chrome_component/', // allowed because it 307's to crlset1.1-vn.com
  'https://dl.google.com/release2/chrome_component/', // allowed because it 307's to crlset1.1-vn.com
  'https://no-thanks.invalid/', // fake gaia URL
  'https://go-updater.1-vn.com/',
  'https://safebrowsing.1-vn.com/',
  'https://onevn-core-ext.s3.1-vn.com/',
  'https://laptop-updates.1-vn.com/',
  'https://static.1-vn.com/',
  'https://static1.1-vn.com/',
  'http://componentupdater.1-vn.com/service/update2', // allowed because it 307's to https://componentupdater.1-vn.com
  'https://componentupdater.1-vn.com/service/update2',
  'https://crlsets.1-vn.com/',
  'https://crxdownload.1-vn.com/crx/blobs/',
  'https://ledger.mercury.basicattentiontoken.org/',
  'https://ledger-staging.mercury.basicattentiontoken.org/',
  'https://balance.mercury.basicattentiontoken.org/',
  'https://balance-staging.mercury.basicattentiontoken.org/',
  'https://publishers.basicattentiontoken.org/',
  'https://publishers-staging.basicattentiontoken.org/',
  'https://updates.onevnsoftware.com/', // remove this once updates are moved to the prod environment
  'https://ads-serve.onevnsoftware.com/', // remove this once ads catalog moves to using prod
  'https://pdfjs.robwu.nl/logpdfjs', // allowed because it gets canceled in tracking protection
  'https://publishers-distro.basicattentiontoken.org/',
  'https://publishers-staging-distro.basicattentiontoken.org/'
]
