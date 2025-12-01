from curses import version
from os.path import isfile
import shutil
Import("env")

def copy_firmware_files():
  print("Copying firmware files...")

  VERSION_FILE="version.txt"
  DESTINATION="../server/firmware/esp8266/{}"
  ORIGIN=".pio/build/nodemcuv2/firmware.bin"
  current_version = "0.0.1"


  with open(VERSION_FILE) as f:
    current_version = f.readline()
    shutil.copyfile(ORIGIN, DESTINATION.format(f'{current_version}.bin'))
    shutil.copyfile(VERSION_FILE, DESTINATION.format("latest.txt"))



def bump_and_get_version():
  VERSION_FILE = 'version.txt'
 
  version = "0.0.1"
  try:
    with open(VERSION_FILE) as f:
      current_version = f.readline().strip().split('.')
      new_version = "{}.{}.{}".format(current_version[0], current_version[1], int(current_version[2]) + 1)
      version = new_version
  except:
    print('Starting build number from x.x.1')
    version = "0.0.1"
  
  with open(VERSION_FILE, 'w+') as f:
    f.write(version)
    print('version number: {}'.format(version))

  return version
 


def load_env_variables():

  assert isfile(".env")
  try:
    f = open(".env", "r")
    lines = f.readlines()
    envs = []
    for line in lines:
      envs.append("-D{}".format(line.strip()))

    envs.append("-DFIRMWARE_VERSION={}".format(bump_and_get_version()))
    env.Append(BUILD_FLAGS=envs)
  except IOError:
    print("File .env not accessible")
  finally:
    f.close()



def post(source, target, env):
  print("Post-build actions...")
  copy_firmware_files()

env.AddPostAction("buildprog", post)

load_env_variables()