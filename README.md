# ESP OTA PoC
## An esp32 and esp8266 example of doing OTA via http on a trusted local network



In a nutshell, this is a proof of concept showcasing a single platformio project that allows for esp8266 and esp32 devices to request a firmware update from local network, manage the request and serve the required firmware.

There's a few extras such as getting creds and other config from .env file and version bumping and firmware copying to the also provided nodejs server

you'll need a .env file with:

```
WIFI_SSID="your wifi ssid"
WIFI_PASSWORD="your wifi password"
REPOSITORY_URL="url to your repo withouth http:// as it cannot be parsed properly (it will be prepended)"
```