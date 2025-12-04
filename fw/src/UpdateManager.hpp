#pragma once
// #define dbg(f, ...) (void)0
#ifdef ESP8266
#define dbg(f, ...) Serial.printf(f, ## __VA_ARGS__)
#elif defined(ESP32)
#define dbg(f, ...) printf(f, ## __VA_ARGS__)
#endif 

#include <Arduino.h>


#ifdef ESP8266
// #include <ESP8266WiFi.h>
#include <ESP8266httpUpdate.h>

#elif defined(ESP32)
#include <WiFi.h>
#include <Update.h>
#include <HTTPClient.h>
#endif

class UpdateManager {
  private:
  String updateEndpoint;
  String firmwareVersion;

  public:
  UpdateManager(String updateEndpoint, String firmwareVersion) {
    this->updateEndpoint = String("http://") + updateEndpoint;
    this->firmwareVersion = firmwareVersion;
  }


  void useWifi(String ssid, String password) {
    WiFi.mode(WIFI_STA);

    if (WiFi.status() == WL_CONNECTED) {
      dbg("Already connected to WiFi, disconnecting... \n");
      WiFi.disconnect();
    }

    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      dbg("Connecting to WiFi... SSID: %s PASS: %s\n", ssid.c_str(), password.c_str());
    }

    dbg("Connected to WiFi \n");
    dbg("Gateway IP: %s \n", WiFi.gatewayIP().toString().c_str());
    dbg("IP Address: %s \n", WiFi.localIP().toString().c_str());
  }


  void checkForUpdates() {
    WiFiClient wifiClient;
    HTTPClient client;

    dbg("Checking for updates, current version %s...\n", firmwareVersion.c_str());
    dbg("Update endpoint: %s\n", this->updateEndpoint.c_str());
    client.begin(wifiClient, this->updateEndpoint);

#ifdef ESP8266
    t_httpUpdate_return ret = ESPhttpUpdate.update(client, this->firmwareVersion);
    switch (ret) {
      case HTTP_UPDATE_FAILED:
        dbg("[update] Update failed. \n");
        break;
      case HTTP_UPDATE_NO_UPDATES:
        dbg("[update] Update no Update. \n");
        break;
      case HTTP_UPDATE_OK:
        dbg("[update] Update ok. \n"); // may not be called since we reboot the ESP
        break;
    }

#elif defined(ESP32)
    client.setUserAgent(F("ESP32-http-Update"));
    client.addHeader(F("x-ESP32-Chip-ID"), String(ESP.getEfuseMac()));
    client.addHeader(F("x-ESP32-STA-MAC"), WiFi.macAddress());
    client.addHeader(F("x-ESP32-AP-MAC"), WiFi.softAPmacAddress());
    client.addHeader(F("x-ESP32-free-space"), String(ESP.getFreeSketchSpace()));
    client.addHeader(F("x-ESP32-sketch-size"), String(ESP.getSketchSize()));
    client.addHeader(F("x-ESP32-sketch-md5"), String(ESP.getSketchMD5()));
    client.addHeader(F("x-ESP32-chip-size"), String(ESP.getFlashChipSize()));
    client.addHeader(F("x-ESP32-sdk-version"), String(ESP.getSdkVersion()));
    client.addHeader(F("x-ESP32-version"), this->firmwareVersion);


    int code = client.GET();
    if (code == HTTP_CODE_OK) {
      int contentLength = client.getSize();
      if (Update.begin(contentLength)) {
        size_t written = Update.writeStream(client.getStream());

        if (written == contentLength) {
          dbg("Written : %d successfully\n", written);
        } else {
          dbg("Written only : %d/%d. Retry?\n", written, contentLength);
        }

        if (Update.end()) {
          dbg("OTA done! \n");
          if (Update.isFinished()) {
            dbg("Update successfully completed. Rebooting.\n");
            delay(300);
            ESP.restart();
          } else {
            dbg("Update not finished? Something went wrong!\n");
          }
        } else {
          dbg("Error Occurred. Error #: %d\n", Update.getError());
        }

      } else {
        dbg("Not enough space to begin OTA\n");
      }
    } else {
      dbg("Cannot download firmware. HTTP code: %d\n", code);
    }
#endif
  }


};
