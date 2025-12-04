#include "main.h"

void debugConfig() {
#ifdef ESP8266
  dbg("------------------------- CONFIG FOR ESP8266 -------------------------\n");
  dbg("WIFI_SSID: %s \n", String(STR(WIFI_SSID)).c_str());
  dbg("WIFI_PASSWORD: %s \n", String(STR(WIFI_PASSWORD)).c_str());
  dbg("REPOSITORY_URL: %s \n", String(STR(REPOSITORY_URL)).c_str());
  dbg("Chip ID: %s \n", String(system_get_chip_id()).c_str());
  dbg("Firmware Build Version: %s \n", String(STR(FIRMWARE_VERSION)).c_str());


#elif defined(ESP32)
  dbg("------------------------- CONFIG FOR ESP32 -------------------------");
  dbg("WIFI_SSID: %s \n", String(STR(WIFI_SSID)).c_str());
  dbg("WIFI_PASSWORD: %s \n", String(STR(WIFI_PASSWORD)).c_str());
  dbg("REPOSITORY_URL: %s \n", String(STR(REPOSITORY_URL)).c_str());
  dbg("Chip ID: %s \n", String(ESP.getEfuseMac()).c_str());
  dbg("Firmware Build Version: %s \n", String(STR(FIRMWARE_VERSION)).c_str());
#endif
}

void setup() {
  delay(3000); // delay to allow for serial connection
#ifdef ESP8266
  Serial.begin(115200);
#endif

  debugConfig();

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  UpdateManager updateManager = UpdateManager(STR(REPOSITORY_URL), STR(FIRMWARE_VERSION));
  updateManager.useWifi(STR(WIFI_SSID), STR(WIFI_PASSWORD));
  updateManager.checkForUpdates();
}

void loop() {
  // Your main code here

  digitalWrite(LED_BUILTIN, HIGH);
  delay(2000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(200);
}