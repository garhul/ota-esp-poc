import shutil

VERSION_FILE="version.txt"
DESTINATION="../server/firmware/esp8266/{}"
ORIGIN="./pio/build/nodemcuv2/firmware.bin"
current_version = "0.0.1"

print("Copying firmware files...")

with open(VERSION_FILE) as f:
  current_version = f.readline()
  shutil.copyfile(ORIGIN, DESTINATION.format(f'{current_version}.bin'))
  shutil.copyfile(VERSION_FILE, DESTINATION.format("latest.txt"))
