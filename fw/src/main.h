#pragma once
#include <Arduino.h>
#include "UpdateManager.hpp"

// #define dbg(f, ...) (void)0
#ifdef ESP8266
#define dbg(f, ...) Serial.printf(f, ## __VA_ARGS__)
#elif defined(ESP32)
#define dbg(f, ...) printf(f, ## __VA_ARGS__)
#endif 

#define XSTR(x) #x
#define STR(x) XSTR(x)
