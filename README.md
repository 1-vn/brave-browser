# OneVN Browser


## Overview 

This repository holds the build tools needed to build the OneVN desktop browser for macOS, Windows, and Linux.  In particular, it fetches and syncs code from the projects we define in `package.json` and `src/onevn/DEPS`:

  - [Chromium](https://chromium.googlesource.com/chromium/src.git)
    - Fetches code via `depot_tools`.
    - sets the branch for Chromium (ex: 65.0.3325.181).
  - [onevn-core](https://github.com/1-vn/onevn-core)
    - Mounted at `src/onevn`.
    - Maintains patches for 3rd party Chromium code.
  - [ad-block](https://github.com/1-vn/ad-block)
    - Mounted at `src/onevn/vendor/ad-block`.
    - Implements OneVN's ad-block engine.
  - [tracking-protection](https://github.com/1-vn/tracking-protection)
    - Mounted at `src/onevn/vendor/tracking-protection`.
    - Implements OneVN's tracking-protection engine.
    
## Build instructions

See the [OneVN Wiki](https://github.com/1-vn/onevn-browser/wiki).

## Downloads

You can [visit our website](https://1-vn.com/downloads.html) to get the latest stable release.

## Other repositories

For other versions of our browser, please see:

* iOS - [onevn/onevn-ios](https://github.com/1-vn/onevn-ios)
* Android - [onevn/browser-android-tabs](https://github.com/1-vn/browser-android-tabs)

## Community

[Join the Q&A community](https://community.1-vn.com/) if you'd like to get more involved with OneVN. You can [ask for help](https://community.1-vn.com/c/help-me),
[discuss features you'd like to see](https://community.1-vn.com/c/feature-requests), and a lot more. We'd love to have your help so that we can continue improving OneVN.

Help us translate OneVN to your language by submitting translations at https://www.transifex.com/onevn/onevn/

Follow [@onevn](https://twitter.com/onevn) on Twitter for important news and announcements.
