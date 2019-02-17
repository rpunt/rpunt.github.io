---
title: Create a DNS record on a Unifi Security Gateway
layout: post
---

{{ layout.title }}

Assuming you've enabled DNSMasq on your [Unifi Security Gateway](https://store.ui.com/products/unifi-security-gateway), you may wish to create local DNS records.

**EDIT**: these records and options seem to be overwritten after a short period. Investigating why.

{% gist 2b03c111f3d167cbee5003b1c5f28297 %}

**EDIT**: Ah-ha. The trick is to save the override file on your Unifi Controller:

```bash
[root@unifi ~]# cat /usr/local/share/java/unifi/data/sites/default/config.gateway.json
{
  "system": {
    "static-host-mapping": {
      "host-name": {
        "vinz": {
          "inet": [
            "192.168.1.11"
          ],
          "alias": [
            "smtp",
            "netdata"
          ]
        },
        "frank": {
          "inet": [
            "192.168.1.12"
          ]
        }
      }
    }
  },
  "service": {
    "dns": {
      "forwarding": {
        "options": [
          "expand-hosts"
        ]
      }
    }
  }
}
```
