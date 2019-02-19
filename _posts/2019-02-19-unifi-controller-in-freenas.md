---
layout: post
title: Installing a Unifi Controller in a Jail on FreeNAS
---


Create a jail and enable VNET:
![enable VNET in your jail configuration]({{ site.url }}/assets/vnet.png)

SSH to your FreeNAS box and run: ```jexec <jailname> sh # (replace <jailname> with your jail's name)```

Run the following commands:

```bash
pkg update && pkg upgrade -y     # Update pkgs
pkg install bash llvm40 openjdk8 # install bash, LLVM, and OpenJDK8
portsnap fetch extract           # Update ports
cd /usr/ports/net-mgmt/unifi5
make install clean BATCH=yes     # Build UniFi
sysrc unifi_enable=YES           # Enable UniFi at boot time
service unifi start              # Start UniFi
```

Note: If you get an error with the message Ports Collection support for your FreeBSD version has ended, run make command with ```ALLOW_UNSUPPORTED_SYSTEM=yes make install clean BATCH=yes```

If you followed the instructions correctly (and nothing else went wrong), you have a running instance of Ubiquiti's UniFi Controller. Once UniFi has started, you can access it by visiting https://< jail IP > :8443/.


### Upgrading to the latest version

SSH to your FreeNAS box and run:

```bash
jexec <jailname> bash
portsnap fetch extract # Update ports
cd /usr/ports/net-mgmt/unifi5
service unifi stop # Stop UniFi
make reinstall clean # Build and re-install
service unifi start # Start UniFi
```
