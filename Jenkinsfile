pipeline {
    agent none
    options {
        disableConcurrentBuilds()
        timeout(time: 12, unit: "HOURS")
        timestamps()
    }
    parameters {
        string(name: "BRANCH", defaultValue: "master", description: "")
        choice(name: "CHANNEL", choices: ["dev", "beta", "release", "nightly"], description: "")
        booleanParam(name: "WIPE_WORKSPACE", defaultValue: false, description: "")
        booleanParam(name: "RUN_INIT", defaultValue: false, description: "")
        booleanParam(name: "DISABLE_SCCACHE", defaultValue: false, description: "")
        booleanParam(name: "BUILD_LINUX", defaultValue: true, description: "")
        booleanParam(name: "BUILD_MAC", defaultValue: true, description: "")
        booleanParam(name: "BUILD_WINDOWS_X64", defaultValue: true, description: "")
        booleanParam(name: "BUILD_WINDOWS_IA32", defaultValue: false, description: "")
        // TODO: add SKIP_SIGNING
        booleanParam(name: "DEBUG", defaultValue: false, description: "")
    }
    environment {
        REFERRAL_API_KEY = credentials("REFERRAL_API_KEY")
        ONEVN_GOOGLE_API_KEY = credentials("npm_config_onevn_google_api_key")
        ONEVN_ARTIFACTS_BUCKET = credentials("onevn-jenkins-artifacts-s3-bucket")
        ONEVN_S3_BUCKET = credentials("onevn-binaries-s3-bucket")
    }
    stages {
        stage("env") {
            steps {
                script {
                    BRANCH = params.BRANCH
                    CHANNEL = params.CHANNEL
                    CHANNEL_CAPITALIZED = CHANNEL.capitalize()
                    WIPE_WORKSPACE = params.WIPE_WORKSPACE
                    RUN_INIT = params.RUN_INIT
                    DISABLE_SCCACHE = params.DISABLE_SCCACHE
                    BUILD_LINUX = params.BUILD_LINUX
                    BUILD_MAC = params.BUILD_MAC
                    BUILD_WINDOWS_X64 = params.BUILD_WINDOWS_X64
                    BUILD_WINDOWS_IA32 = params.BUILD_WINDOWS_IA32
                    DEBUG = params.DEBUG
                    BUILD_TYPE = "Release"
                    OUT_DIR = "src/out/" + BUILD_TYPE
                    LINT_BRANCH = "TEMP_LINT_BRANCH_" + BUILD_NUMBER
                    RELEASE_TYPE = (JOB_NAME == "onevn-browser-build" ? "release" : "ci")
                    BRANCH_TO_BUILD = (env.CHANGE_BRANCH == null ? BRANCH : env.CHANGE_BRANCH)
                    ONEVN_GITHUB_TOKEN = "onevn-browser-releases-github"
                    GITHUB_API = "https://api.github.com/repos/1-vn"
                    GITHUB_CREDENTIAL_ID = "onevn-builds-github-token-for-pr-builder"
                    // BRANCH_EXISTS_IN_BC = httpRequest(url: GITHUB_API + "/onevn-core/branches/" + BRANCH_TO_BUILD, validResponseCodes: '100:499', authentication: GITHUB_CREDENTIAL_ID, quiet: !DEBUG).status == 200
                    SKIP = false
                    if (env.CHANGE_BRANCH) {
                        prNumber = readJSON(text: httpRequest(url: GITHUB_API + "/onevn-browser/pulls?head=onevn:" + BRANCH_TO_BUILD, authentication: GITHUB_CREDENTIAL_ID, quiet: !DEBUG).content)[0].number
                        prDetails = readJSON(text: httpRequest(url: GITHUB_API + "/onevn-browser/pulls/" + prNumber, authentication: GITHUB_CREDENTIAL_ID, quiet: !DEBUG).content)
                        SKIP = prDetails.mergeable_state.equals("draft") or prDetails.labels.count { label -> label.name.equals("CI/Skip") }.equals(1)
                    }
                }
            }
        }
        stage("continue") {
            when {
                beforeAgent true
                expression { SKIP }
            }
            steps {
                script {
                    print "PR is in draft or has \"CI/Skip\" label, aborting build!"
                    currentBuild.result = "ABORTED"
                }
            }
        }
        stage("build-all") {
            when {
                beforeAgent true
                expression { !SKIP }
            }
            parallel {
                stage("linux") {
                    when {
                        beforeAgent true
                        expression { BUILD_LINUX }
                    }
                    agent { label "linux-${RELEASE_TYPE}" }
                    environment {
                        GIT_CACHE_PATH = "${HOME}/cache"
                        SCCACHE_BUCKET = credentials("onevn-browser-sccache-linux-s3-bucket")
                    }
                    stages {
                        stage("checkout") {
                            when {
                                anyOf {
                                    expression { WIPE_WORKSPACE }
                                    expression { return !fileExists("package.json") }
                                }
                            }
                            steps {
                                checkout([$class: 'GitSCM', branches: [[name: "${BRANCH_TO_BUILD}"]], extensions: [[$class: 'WipeWorkspace']], userRemoteConfigs: [[url: 'https://github.com/1-vn/onevn-browser.git']]])
                            }
                        }
                        // stage("pin") {
                        //     when {
                        //         expression { BRANCH_EXISTS_IN_BC }
                        //     }
                        //     steps {
                        //         sh """
                        //             jq 'del(.config.projects["onevn-core"].branch) | .config.projects["onevn-core"].branch="${BRANCH_TO_BUILD}"' package.json > package.json.new
                        //             mv package.json.new package.json
                        //         """
                        //     }
                        // }
                        stage("install") {
                            steps {
                                sh "npm install --no-optional"
                                sh "rm -rf ${GIT_CACHE_PATH}/*.lock"
                            }
                        }
                        stage("init") {
                            when {
                                expression { return !fileExists("src/onevn/package.json") || RUN_INIT }
                            }
                            steps {
                                sh "npm run init"
                            }
                        }
                        stage("sync") {
                            steps {
                                sh "npm run sync -- --all"
                            }
                        }
                        stage("lint") {
                            steps {
                                script {
                                    try {
                                        sh """
                                            git -C src/onevn config user.name onevn-builds
                                            git -C src/onevn config user.email devops@1-vn.com
                                            git -C src/onevn checkout -b ${LINT_BRANCH}
                                            npm run lint
                                            git -C src/onevn checkout -q -
                                            git -C src/onevn branch -D ${LINT_BRANCH}
                                        """
                                    }
                                    catch (ex) {
                                        currentBuild.result = "UNSTABLE"
                                    }
                                }
                            }
                        }
                        stage("sccache") {
                            when {
                                anyOf {
                                    expression { "${DISABLE_SCCACHE}" == "false" }
                                    expression { "${RELEASE_TYPE}" == "ci" }
                                }
                            }
                            steps {
                                sh "npm config --userconfig=.npmrc set sccache sccache"
                            }
                        }
                        stage("build") {
                            steps {
                                sh """
                                    npm config --userconfig=.npmrc set onevn_referrals_api_key ${REFERRAL_API_KEY}
                                    npm config --userconfig=.npmrc set onevn_google_api_endpoint https://location.services.mozilla.com/v1/geolocate?key=
                                    npm config --userconfig=.npmrc set onevn_google_api_key ${ONEVN_GOOGLE_API_KEY}
                                    npm config --userconfig=.npmrc set google_api_endpoint safebrowsing.1-vn.com
                                    npm config --userconfig=.npmrc set google_api_key dummytoken
                                    npm run build -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true
                                """
                            }
                        }
                        stage("test-security") {
                            steps {
                                timeout(time: 4, unit: "MINUTES") {
                                    script {
                                        try {
                                            sh "npm run test-security -- --output_path=\"${OUT_DIR}/onevn\""
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("test-unit") {
                            steps {
                                timeout(time: 20, unit: "MINUTES") {
                                    script {
                                        try {
                                            sh "npm run test -- onevn_unit_tests ${BUILD_TYPE} --output onevn_unit_tests.xml"
                                            xunit([GoogleTest(deleteOutputFiles: true, failIfNotNew: true, pattern: "src/onevn_unit_tests.xml", skipNoTestFiles: false, stopProcessingIfError: true)])
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("test-browser") {
                            steps {
                                timeout(time: 20, unit: "MINUTES") {
                                    script {
                                        try {
                                            sh "npm run test -- onevn_browser_tests ${BUILD_TYPE} --output onevn_browser_tests.xml"
                                            xunit([GoogleTest(deleteOutputFiles: true, failIfNotNew: true, pattern: "src/onevn_browser_tests.xml", skipNoTestFiles: false, stopProcessingIfError: true)])
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("dist") {
                            steps {
                                sh "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true"
                            }
                        }
                        stage("archive") {
                            steps {
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "*.deb",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "*.rpm",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                            }
                        }
                    }
                }
                stage("mac") {
                    when {
                        beforeAgent true
                        expression { BUILD_MAC }
                    }
                    agent { label "mac-${RELEASE_TYPE}" }
                    environment {
                        GIT_CACHE_PATH = "${HOME}/cache"
                        SCCACHE_BUCKET = credentials("onevn-browser-sccache-mac-s3-bucket")
                    }
                    stages {
                        stage("checkout") {
                            when {
                                anyOf {
                                    expression { WIPE_WORKSPACE }
                                    expression { return !fileExists("package.json") }
                                }
                            }
                            steps {
                                checkout([$class: 'GitSCM', branches: [[name: "${BRANCH_TO_BUILD}"]], extensions: [[$class: 'WipeWorkspace']], userRemoteConfigs: [[url: 'https://github.com/1-vn/onevn-browser.git']]])
                            }
                        }
                        // stage("pin") {
                        //     when {
                        //         expression { BRANCH_EXISTS_IN_BC }
                        //     }
                        //     steps {
                        //         sh """
                        //             jq 'del(.config.projects["onevn-core"].branch) | .config.projects["onevn-core"].branch="${BRANCH_TO_BUILD}"' package.json > package.json.new
                        //             mv package.json.new package.json
                        //         """
                        //     }
                        // }
                        stage("install") {
                            steps {
                                sh "npm install --no-optional"
                                sh "rm -rf ${GIT_CACHE_PATH}/*.lock"
                            }
                        }
                        stage("init") {
                            when {
                                expression { return !fileExists("src/onevn/package.json") || RUN_INIT }
                            }
                            steps {
                                sh "npm run init"
                            }
                        }
                        stage("sync") {
                            steps {
                                sh "npm run sync -- --all"
                            }
                        }
                        stage("lint") {
                            steps {
                                script {
                                    try {
                                        sh """
                                            git -C src/onevn config user.name onevn-builds
                                            git -C src/onevn config user.email devops@1-vn.com
                                            git -C src/onevn checkout -b ${LINT_BRANCH}
                                            npm run lint
                                            git -C src/onevn checkout -q -
                                            git -C src/onevn branch -D ${LINT_BRANCH}
                                        """
                                    }
                                    catch (ex) {
                                        currentBuild.result = "UNSTABLE"
                                    }
                                }
                            }
                        }
                        stage("sccache") {
                            when {
                                anyOf {
                                    expression { "${DISABLE_SCCACHE}" == "false" }
                                    expression { "${RELEASE_TYPE}" == "ci" }
                                }
                            }
                            steps {
                                sh "npm config --userconfig=.npmrc set sccache sccache"
                            }
                        }
                        stage("build") {
                            steps {
                                sh """
                                    npm config --userconfig=.npmrc set onevn_referrals_api_key ${REFERRAL_API_KEY}
                                    npm config --userconfig=.npmrc set onevn_google_api_endpoint https://location.services.mozilla.com/v1/geolocate?key=
                                    npm config --userconfig=.npmrc set onevn_google_api_key ${ONEVN_GOOGLE_API_KEY}
                                    npm config --userconfig=.npmrc set google_api_endpoint safebrowsing.1-vn.com
                                    npm config --userconfig=.npmrc set google_api_key dummytoken
                                    npm run build -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true
                                """
                            }
                        }
                        stage("test-security") {
                            steps {
                                timeout(time: 4, unit: "MINUTES") {
                                    script {
                                        try {
                                            sh "npm run test-security -- --output_path=\"${OUT_DIR}/Onevn\\ Browser\\ ${CHANNEL_CAPITALIZED}.app/Contents/MacOS/Onevn\\ Browser\\ ${CHANNEL_CAPITALIZED}\""
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("test-unit") {
                            steps {
                                timeout(time: 20, unit: "MINUTES") {
                                    script {
                                        try {
                                            sh "npm run test -- onevn_unit_tests ${BUILD_TYPE} --output onevn_unit_tests.xml"
                                            xunit([GoogleTest(deleteOutputFiles: true, failIfNotNew: true, pattern: "src/onevn_unit_tests.xml", skipNoTestFiles: false, stopProcessingIfError: true)])
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("test-browser") {
                            steps {
                                timeout(time: 20, unit: "MINUTES") {
                                    script {
                                        try {
                                            sh "npm run test -- onevn_browser_tests ${BUILD_TYPE} --output onevn_browser_tests.xml"
                                            xunit([GoogleTest(deleteOutputFiles: true, failIfNotNew: true, pattern: "src/onevn_browser_tests.xml", skipNoTestFiles: false, stopProcessingIfError: true)])
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("dist-ci") {
                            when {
                                expression { "${RELEASE_TYPE}" == "ci" }
                            }
                            steps {
                                sh "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true --skip_signing"
                            }
                        }
                        stage("dist-release") {
                            when {
                                expression { "${RELEASE_TYPE}" == "release" }
                            }
                            steps {
                                sh "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true"
                            }
                        }
                        stage("archive") {
                            steps {
                                withAWS(credentials: "mac-build-s3-upload-artifacts", region: "us-west-2") {
                                    s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "unsigned_dmg/*.dmg",
                                        path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                    )
                                }
                                withAWS(credentials: "mac-build-s3-upload-artifacts", region: "us-west-2") {
                                    s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "*.dmg",
                                        path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                    )
                                }
                                withAWS(credentials: "mac-build-s3-upload-artifacts", region: "us-west-2") {
                                    s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "*.pkg",
                                        path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                    )
                                }
                            }
                        }
                    }
                }
                stage("windows-x64") {
                    when {
                        beforeAgent true
                        expression { BUILD_WINDOWS_X64 }
                    }
                    agent { label "windows-${RELEASE_TYPE}" }
                    environment {
                        GIT_CACHE_PATH = "${USERPROFILE}\\cache"
                        SCCACHE_BUCKET = credentials("onevn-browser-sccache-win-s3-bucket")
                        PATH = "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17134.0\\x64\\;C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Common7\\IDE\\Remote Debugger\\x64;${PATH}"
                        SIGNTOOL_ARGS = "sign /t http://timestamp.verisign.com/scripts/timstamp.dll /fd sha256 /sm"
                        CERT = "Onevn"
                        KEY_CER_PATH = "C:\\jenkins\\digicert-key\\digicert.cer"
                        KEY_PFX_PATH = "C:\\jenkins\\digicert-key\\digicert.pfx"
                        AUTHENTICODE_PASSWORD = credentials("digicert-onevn-browser-development-certificate-ps-escaped")
                        AUTHENTICODE_PASSWORD_UNESCAPED = credentials("digicert-onevn-browser-development-certificate")
                    }
                    stages {
                        stage("checkout") {
                            when {
                                anyOf {
                                    expression { WIPE_WORKSPACE }
                                    expression { return !fileExists("package.json") }
                                }
                            }
                            steps {
                                checkout([$class: 'GitSCM', branches: [[name: "${BRANCH_TO_BUILD}"]], extensions: [[$class: 'WipeWorkspace']], userRemoteConfigs: [[url: 'https://github.com/1-vn/onevn-browser.git']]])
                            }
                        }
                        // stage("pin") {
                        //     when {
                        //         expression { BRANCH_EXISTS_IN_BC }
                        //     }
                        //     steps {
                        //         powershell """
                        //             jq "del(.config.projects[`"onevn-core`"].branch) | .config.projects[`"onevn-core`"].branch=`"${BRANCH_TO_BUILD}`"" package.json > package.json.new
                        //             Move-Item -Force package.json.new package.json
                        //         """
                        //     }
                        // }
                        stage("install") {
                            steps {
                                powershell "npm install --no-optional"
                                powershell "Remove-Item ${GIT_CACHE_PATH}/*.lock"
                            }
                        }
                        stage("init") {
                            when {
                                expression { return !fileExists("src/onevn/package.json") || RUN_INIT }
                            }
                            steps {
                                powershell "npm run init"
                            }
                        }
                        stage("sync") {
                            steps {
                                powershell "npm run sync -- --all"
                            }
                        }
                        stage("lint") {
                            steps {
                                script {
                                    try {
                                        powershell """
                                            git -C src/onevn config user.name onevn-builds
                                            git -C src/onevn config user.email devops@1-vn.com
                                            git -C src/onevn checkout -b ${LINT_BRANCH}
                                            npm run lint
                                            git -C src/onevn checkout -q -
                                            git -C src/onevn branch -D ${LINT_BRANCH}
                                        """
                                    }
                                    catch (ex) {
                                        currentBuild.result = "UNSTABLE"
                                    }
                                }
                            }
                        }
                        // TODO: add sccache
                        stage("build") {
                            steps {
                                powershell """
                                    npm config --userconfig=.npmrc set onevn_referrals_api_key ${REFERRAL_API_KEY}
                                    npm config --userconfig=.npmrc set onevn_google_api_endpoint https://location.services.mozilla.com/v1/geolocate?key=
                                    npm config --userconfig=.npmrc set onevn_google_api_key ${ONEVN_GOOGLE_API_KEY}
                                    npm config --userconfig=.npmrc set google_api_endpoint safebrowsing.1-vn.com
                                    npm config --userconfig=.npmrc set google_api_key dummytoken
                                    npm run build -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true
                                """
                            }
                        }
                        stage("test-security") {
                            steps {
                                timeout(time: 4, unit: "MINUTES") {
                                    script {
                                        try {
                                            powershell "npm run test-security -- --output_path=\"${OUT_DIR}/onevn.exe\""
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("test-unit") {
                            steps {
                                timeout(time: 20, unit: "MINUTES") {
                                    script {
                                        try {
                                            powershell "npm run test -- onevn_unit_tests ${BUILD_TYPE} --output onevn_unit_tests.xml"
                                            xunit([GoogleTest(deleteOutputFiles: true, failIfNotNew: true, pattern: "src/onevn_unit_tests.xml", skipNoTestFiles: false, stopProcessingIfError: true)])
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        // TODO: add test-browser
                        stage("dist-ci") {
                            when {
                                expression { "${RELEASE_TYPE}" == "ci" }
                            }
                            steps {
                                powershell """
                                    Import-PfxCertificate -FilePath \"${KEY_PFX_PATH}\" -CertStoreLocation "Cert:\\LocalMachine\\My" -Password (ConvertTo-SecureString -String \"${AUTHENTICODE_PASSWORD_UNESCAPED}\" -AsPlaintext -Force)
                                    npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true --skip_signing
                                """
                                powershell '(Get-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat) | % { $_ -replace "10.0.15063.0\", "" } | Set-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat'
                                powershell "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --build_omaha --tag_ap=x64-${CHANNEL} --target_arch=x64 --official_build=true --skip_signing"
                            }
                        }
                        stage("dist-release") {
                            when {
                                expression { "${RELEASE_TYPE}" == "release" }
                            }
                            steps {
                                powershell """
                                    Import-PfxCertificate -FilePath \"${KEY_PFX_PATH}\" -CertStoreLocation "Cert:\\LocalMachine\\My" -Password (ConvertTo-SecureString -String \"${AUTHENTICODE_PASSWORD_UNESCAPED}\" -AsPlaintext -Force)
                                    npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true
                                """
                                powershell '(Get-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat) | % { $_ -replace "10.0.15063.0\", "" } | Set-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat'
                                powershell "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --build_omaha --tag_ap=x64-${CHANNEL} --target_arch=x64 --official_build=true"
                            }
                        }
                        stage("archive") {
                            steps {
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "onevn_installer_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowser${CHANNEL_CAPITALIZED}Setup_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserSilent${CHANNEL_CAPITALIZED}Setup_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserStandalone${CHANNEL_CAPITALIZED}Setup_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserStandaloneSilent${CHANNEL_CAPITALIZED}Setup_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserStandaloneUntagged${CHANNEL_CAPITALIZED}Setup_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserUntagged${CHANNEL_CAPITALIZED}Setup_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                            }
                        }
                    }
                }
                stage("windows-ia32") {
                    when {
                        beforeAgent true
                        expression { BUILD_WINDOWS_IA32 }
                    }
                    agent { label "windows-${RELEASE_TYPE}" }
                    environment {
                        GIT_CACHE_PATH = "${USERPROFILE}\\cache"
                        SCCACHE_BUCKET = credentials("onevn-browser-sccache-win-s3-bucket")
                        PATH = "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17134.0\\x64\\;C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Common7\\IDE\\Remote Debugger\\x64;${PATH}"
                        SIGNTOOL_ARGS = "sign /t http://timestamp.verisign.com/scripts/timstamp.dll /fd sha256 /sm"
                        CERT = "Onevn"
                        KEY_CER_PATH = "C:\\jenkins\\digicert-key\\digicert.cer"
                        KEY_PFX_PATH = "C:\\jenkins\\digicert-key\\digicert.pfx"
                        AUTHENTICODE_PASSWORD = credentials("digicert-onevn-browser-development-certificate-ps-escaped")
                        AUTHENTICODE_PASSWORD_UNESCAPED = credentials("digicert-onevn-browser-development-certificate")
                    }
                    stages {
                        stage("checkout") {
                            when {
                                anyOf {
                                    expression { WIPE_WORKSPACE }
                                    expression { return !fileExists("package.json") }
                                }
                            }
                            steps {
                                checkout([$class: 'GitSCM', branches: [[name: "${BRANCH_TO_BUILD}"]], extensions: [[$class: 'WipeWorkspace']], userRemoteConfigs: [[url: 'https://github.com/1-vn/onevn-browser.git']]])
                            }
                        }
                        // stage("pin") {
                        //     when {
                        //         expression { BRANCH_EXISTS_IN_BC }
                        //     }
                        //     steps {
                        //         powershell """
                        //             jq "del(.config.projects[`"onevn-core`"].branch) | .config.projects[`"onevn-core`"].branch=`"${BRANCH_TO_BUILD}`"" package.json > package.json.new
                        //             Move-Item -Force package.json.new package.json
                        //         """
                        //     }
                        // }
                        stage("install") {
                            steps {
                                powershell "npm install --no-optional"
                                powershell "Remove-Item ${GIT_CACHE_PATH}/*.lock"
                            }
                        }
                        stage("init") {
                            when {
                                expression { return !fileExists("src/onevn/package.json") || RUN_INIT }
                            }
                            steps {
                                powershell "npm run init"
                            }
                        }
                        stage("sync") {
                            steps {
                                powershell "npm run sync -- --all"
                            }
                        }
                        stage("lint") {
                            steps {
                                script {
                                    try {
                                        powershell """
                                            git -C src/onevn config user.name onevn-builds
                                            git -C src/onevn config user.email devops@1-vn.com
                                            git -C src/onevn checkout -b ${LINT_BRANCH}
                                            npm run lint
                                            git -C src/onevn checkout -q -
                                            git -C src/onevn branch -D ${LINT_BRANCH}
                                        """
                                    }
                                    catch (ex) {
                                        currentBuild.result = "UNSTABLE"
                                    }
                                }
                            }
                        }
                        // TODO: add sccache
                        stage("build") {
                            steps {
                                powershell """
                                    npm config --userconfig=.npmrc set onevn_referrals_api_key ${REFERRAL_API_KEY}
                                    npm config --userconfig=.npmrc set onevn_google_api_endpoint https://location.services.mozilla.com/v1/geolocate?key=
                                    npm config --userconfig=.npmrc set onevn_google_api_key ${ONEVN_GOOGLE_API_KEY}
                                    npm config --userconfig=.npmrc set google_api_endpoint safebrowsing.1-vn.com
                                    npm config --userconfig=.npmrc set google_api_key dummytoken
                                    npm run build -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true --target_arch=ia32
                                """
                            }
                        }
                        stage("test-security") {
                            steps {
                                timeout(time: 4, unit: "MINUTES") {
                                    script {
                                        try {
                                            powershell "npm run test-security -- --output_path=\"${OUT_DIR}/onevn.exe\""
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        stage("test-unit") {
                            steps {
                                timeout(time: 20, unit: "MINUTES") {
                                    script {
                                        try {
                                            powershell "npm run test -- onevn_unit_tests ${BUILD_TYPE} --output onevn_unit_tests.xml"
                                            xunit([GoogleTest(deleteOutputFiles: true, failIfNotNew: true, pattern: "src/onevn_unit_tests.xml", skipNoTestFiles: false, stopProcessingIfError: true)])
                                        }
                                        catch (ex) {
                                            currentBuild.result = "UNSTABLE"
                                        }
                                    }
                                }
                            }
                        }
                        // TODO: add test-browser
                        stage("dist-ci") {
                            when {
                                expression { "${RELEASE_TYPE}" == "ci" }
                            }
                            steps {
                                powershell """
                                    Import-PfxCertificate -FilePath \"${KEY_PFX_PATH}\" -CertStoreLocation "Cert:\\LocalMachine\\My" -Password (ConvertTo-SecureString -String \"${AUTHENTICODE_PASSWORD_UNESCAPED}\" -AsPlaintext -Force)
                                    npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true --skip_signing
                                """
                                powershell '(Get-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat) | % { $_ -replace "10.0.15063.0\", "" } | Set-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat'
                                powershell "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --build_omaha --tag_ap=x86-${CHANNEL} --target_arch=ia32 --official_build=true --skip_signing"
                            }
                        }
                        stage("dist-release") {
                            when {
                                expression { "${RELEASE_TYPE}" == "release" }
                            }
                            steps {
                                powershell """
                                    Import-PfxCertificate -FilePath \"${KEY_PFX_PATH}\" -CertStoreLocation "Cert:\\LocalMachine\\My" -Password (ConvertTo-SecureString -String \"${AUTHENTICODE_PASSWORD_UNESCAPED}\" -AsPlaintext -Force)
                                    npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --official_build=true
                                """
                                powershell '(Get-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat) | % { $_ -replace "10.0.15063.0\", "" } | Set-Content src\\onevn\\vendor\\omaha\\omaha\\hammer-onevn.bat'
                                powershell "npm run create_dist -- ${BUILD_TYPE} --channel=${CHANNEL} --build_omaha --tag_ap=x86-${CHANNEL} --target_arch=ia32 --official_build=true"
                            }
                        }
                        stage("archive") {
                            steps {
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "onevn_installer_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowser${CHANNEL_CAPITALIZED}Setup32_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserSilent${CHANNEL_CAPITALIZED}Setup32_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserStandalone${CHANNEL_CAPITALIZED}Setup32_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserStandaloneSilent${CHANNEL_CAPITALIZED}Setup32_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserStandaloneUntagged${CHANNEL_CAPITALIZED}Setup32_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                                s3Upload(acl: "Private", bucket: "${ONEVN_ARTIFACTS_BUCKET}", includePathPattern: "OnevnBrowserUntagged${CHANNEL_CAPITALIZED}Setup32_*.exe",
                                    path: "${JOB_NAME}/${BUILD_NUMBER}/", pathStyleAccessEnabled: true, payloadSigningEnabled: true, workingDir: "${OUT_DIR}"
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
