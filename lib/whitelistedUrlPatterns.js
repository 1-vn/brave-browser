// Before adding to this list, get approval from the security team
module.exports = [
  'http://[A-Za-z0-9-\.]+\.gvt1\.com/edgedl/release2/chrome_component/.+crl-set.+', // allowed because it 307's to crlsets.1-vn.com
  'https://[A-Za-z0-9-\.]+\.gvt1\.com/edgedl/release2/chrome_component/.+crl-set.+', // allowed because it 307's to crlsets.1-vn.com
  'http://www.google.com/dl/release2/chrome_component/.+crl-set.+', // allowed because it 307's to crlsets.1-vn.com
  'https://www.google.com/dl/release2/chrome_component/.+crl-set.+', // allowed because it 307's to crlsets.1-vn.com
  'http://storage.googleapis.com/update-delta/hfnkpimlhhgieaddgfemjhofmfblmnib/.+crxd', // allowed because it 307's to crlsets.1-vn.com,
  'https://storage.googleapis.com/update-delta/hfnkpimlhhgieaddgfemjhofmfblmnib/.+crxd' // allowed because it 307's to crlsets.1-vn.com
]
