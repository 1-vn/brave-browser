Installing Onevn
################

Linux
*****

NOTE: If Onevn does not start and shows an error about sandboxing, you may need
to enable `user namespaces
<https://superuser.com/questions/1094597/enable-user-namespaces-in-debian-kernel#1122977>`_. For security reasons, we do NOT recommend running with the ``--no-sandbox`` flag. For more info, see https://github.com/1-vn/onevn-browser/issues/1986#issuecomment-445057361.

NOTE: While we recommend you to use our official packages, there's a section for unofficial package in the case where we don't ship packages for your distribution. These packages are community maintained, and therefore we take no responsibility for them.

Release Channel Installation
============================

.. highlight:: console

Ubuntu 16.04+ and Mint 18+
--------------------------
::

    curl -s https://onevn-browser-apt-release.s3.1-vn.com/onevn-core.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-release.gpg add -

    source /etc/os-release

    echo "deb [arch=amd64] https://onevn-browser-apt-release.s3.1-vn.com/ $UBUNTU_CODENAME main" | sudo tee /etc/apt/sources.list.d/onevn-browser-release-${UBUNTU_CODENAME}.list

    sudo apt update

    sudo apt install onevn-keyring onevn-browser

Mint 17
-------
::

    curl -s https://onevn-browser-apt-release.s3.1-vn.com/onevn-core.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-release.gpg add -

    echo "deb [arch=amd64] https://onevn-browser-apt-release.s3.1-vn.com/ trusty main" | sudo tee /etc/apt/sources.list.d/onevn-browser-release-trusty.list

    sudo apt update

    sudo apt install onevn-keyring onevn-browser

Fedora 28+
----------
::

    sudo dnf config-manager --add-repo https://onevn-browser-rpm-release.s3.1-vn.com/x86_64/

    sudo rpm --import https://onevn-browser-rpm-release.s3.1-vn.com/onevn-core.asc

    sudo dnf install onevn-keyring onevn-browser

CentOS/RHEL
-----------
::

    sudo rpm --import https://onevn-browser-rpm-release.s3.1-vn.com/onevn-core.asc

    cat << EOF | sudo tee /etc/yum.repos.d/onevn-browser-release.repo
    [onevn-browser-release]
    name=Onevn Browser Release Channel repository
    baseurl=https://onevn-browser-rpm-release.s3.1-vn.com/x86_64/
    enabled=1
    EOF

    sudo yum install onevn-keyring onevn-browser

The key you're importing should have fingerprint ``D8BA D4DE 7EE1 7AF5 2A83  4B2D 0BB7 5829 C2D4 E821``.


Beta Channel Installation
=========================

.. highlight:: console

Ubuntu 16.04+ and Mint 18+
--------------------------
::

    curl -s https://onevn-browser-apt-beta.s3.1-vn.com/onevn-core-nightly.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-beta.gpg add -

    source /etc/os-release

    echo "deb [arch=amd64] https://onevn-browser-apt-beta.s3.1-vn.com/ $UBUNTU_CODENAME main" | sudo tee /etc/apt/sources.list.d/onevn-browser-beta-${UBUNTU_CODENAME}.list

    sudo apt update

    sudo apt install onevn-browser-beta

Mint 17
-------
::

    curl -s https://onevn-browser-apt-beta.s3.1-vn.com/onevn-core-nightly.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-beta.gpg add -

    echo "deb [arch=amd64] https://onevn-browser-apt-beta.s3.1-vn.com/ trusty main" | sudo tee /etc/apt/sources.list.d/onevn-browser-beta-trusty.list

    sudo apt update

    sudo apt install onevn-browser-beta

Fedora 28+
----------
::

    sudo dnf config-manager --add-repo https://onevn-browser-rpm-beta.s3.1-vn.com/x86_64/

    sudo rpm --import https://onevn-browser-rpm-beta.s3.1-vn.com/onevn-core-nightly.asc

    sudo dnf install onevn-browser-beta

CentOS/RHEL
-----------
::

    sudo rpm --import https://onevn-browser-rpm-beta.s3.1-vn.com/onevn-core-nightly.asc

    cat << EOF | sudo tee /etc/yum.repos.d/onevn-browser-beta.repo
    [onevn-browser-beta]
    name=Onevn Browser Beta Channel repository
    baseurl=https://onevn-browser-rpm-beta.s3.1-vn.com/x86_64/
    enabled=1
    EOF

    sudo yum install onevn-browser-beta

The key you're importing should have fingerprint ``9228 DBCE 20DD E5EC 4648  8DE9 0B31 DBA0 6A8A 26F9``.


Development Channel Installation
================================

.. highlight:: console

Ubuntu 16.04+ and Mint 18+
--------------------------
::

    curl -s https://onevn-browser-apt-dev.s3.1-vn.com/onevn-core-nightly.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-dev.gpg add -

    source /etc/os-release

    echo "deb [arch=amd64] https://onevn-browser-apt-dev.s3.1-vn.com/ $UBUNTU_CODENAME main" | sudo tee /etc/apt/sources.list.d/onevn-browser-dev-${UBUNTU_CODENAME}.list

    sudo apt update

    sudo apt install onevn-browser-dev

Mint 17
-------
::

    curl -s https://onevn-browser-apt-dev.s3.1-vn.com/onevn-core-nightly.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-dev.gpg add -

    echo "deb [arch=amd64] https://onevn-browser-apt-dev.s3.1-vn.com/ trusty main" | sudo tee /etc/apt/sources.list.d/onevn-browser-dev-trusty.list

    sudo apt update

    sudo apt install onevn-browser-dev

Fedora 28+
----------
::

    sudo dnf config-manager --add-repo https://onevn-browser-rpm-dev.s3.1-vn.com/x86_64/

    sudo rpm --import https://onevn-browser-rpm-dev.s3.1-vn.com/onevn-core-nightly.asc

    sudo dnf install onevn-browser-dev

CentOS/RHEL
-----------
::

    sudo rpm --import  https://onevn-browser-rpm-dev.s3.1-vn.com/onevn-core-nightly.asc

    cat << EOF | sudo tee /etc/yum.repos.d/onevn-browser-dev.repo
    [onevn-browser-dev]
    name=Onevn Browser Dev Channel repository
    baseurl=https://onevn-browser-rpm-dev.s3.1-vn.com/x86_64/
    enabled=1
    EOF

    sudo yum install onevn-browser-dev

The key you're importing should have fingerprint ``9228 DBCE 20DD E5EC 4648  8DE9 0B31 DBA0 6A8A 26F9``.


Nightly Channel Installation
============================

.. highlight:: console

Ubuntu 16.04+ and Mint 18+
--------------------------
::

    curl -s https://onevn-browser-apt-nightly.s3.1-vn.com/onevn-core-nightly.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-nightly.gpg add -

    source /etc/os-release

    echo "deb [arch=amd64] https://onevn-browser-apt-nightly.s3.1-vn.com/ $UBUNTU_CODENAME main" | sudo tee /etc/apt/sources.list.d/onevn-browser-nightly-${UBUNTU_CODENAME}.list

    sudo apt update

    sudo apt install onevn-browser-nightly

Mint 17
-------
::

    curl -s https://onevn-browser-apt-nightly.s3.1-vn.com/onevn-core-nightly.asc | sudo apt-key --keyring /etc/apt/trusted.gpg.d/onevn-browser-nightly.gpg add -

    echo "deb [arch=amd64] https://onevn-browser-apt-nightly.s3.1-vn.com/ trusty main" | sudo tee /etc/apt/sources.list.d/onevn-browser-nightly-trusty.list

    sudo apt update

    sudo apt install onevn-browser-nightly

Fedora 28+
----------
::

    sudo dnf config-manager --add-repo https://onevn-browser-rpm-nightly.s3.1-vn.com/x86_64/

    sudo rpm --import https://onevn-browser-rpm-nightly.s3.1-vn.com/onevn-core-nightly.asc

    sudo dnf install onevn-browser-nightly

CentOS/RHEL
-----------
::

    sudo rpm --import  https://onevn-browser-rpm-nightly.s3.1-vn.com/onevn-core-nightly.asc

    cat << EOF | sudo tee /etc/yum.repos.d/onevn-browser-nightly.repo
    [onevn-browser-nightly]
    name=Onevn Browser Nightly Channel repository
    baseurl=https://onevn-browser-rpm-nightly.s3.1-vn.com/x86_64/
    enabled=1
    EOF

    sudo yum install onevn-browser-nightly

The key you're importing should have fingerprint ``9228 DBCE 20DD E5EC 4648  8DE9 0B31 DBA0 6A8A 26F9``.


Unofficial packages
============================

.. highlight:: console

Solus 
-----------
::

    sudo eopkg it onevn
    
The Solus
package is a repackaging of the .deb file in to the Solus software format (.eopkg). It is currently maintained by Jacalz.
