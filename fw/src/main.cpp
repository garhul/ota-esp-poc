#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266httpUpdate.h>

#define XSTR(x) #x
#define STR(x) XSTR(x)

void startWiFi() {
  // Connect to WiFi
  WiFi.begin(STR(WIFI_SSID), STR(WIFI_PASSWORD));
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  // WiFi.printDiag(Serial);
  Serial.println("Gateway IP: " + WiFi.gatewayIP().toString());
  Serial.println("IP Address: " + WiFi.localIP().toString());
}


void getLatestFirmware() {
  WiFiClient client;
  t_httpUpdate_return ret = ESPhttpUpdate.update(client, STR(REPOSITORY_URL), 3000, "/hasUpdates/esp8266", STR(FIRMWARE_VERSION));
  switch (ret) {
    case HTTP_UPDATE_FAILED:
      Serial.println("[update] Update failed.");
      break;
    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("[update] Update no Update.");
      break;
    case HTTP_UPDATE_OK:
      Serial.println("[update] Update ok."); // may not be called since we reboot the ESP
      break;
  }
}

void setup() {
  delay(5000); // delay to allow for serial connection
  Serial.begin(115200);
  Serial.println(String("WIFI_SSID: ") + String(STR(WIFI_SSID)));
  Serial.println(String("WIFI_PASSWORD: ") + String(STR(WIFI_PASSWORD)));
  Serial.println(String("REPOSITORY_URL: ") + String(STR(REPOSITORY_URL)));
  Serial.println("Chip ID: " + String(ESP.getChipId()));
  Serial.println("Firmware Version: " + String(STR(FIRMWARE_VERSION)));

  startWiFi();
  delay(1000);

  getLatestFirmware();

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

}


void loop() {


  // Your main code here

  digitalWrite(LED_BUILTIN, HIGH);
  delay(2000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(2000);

}