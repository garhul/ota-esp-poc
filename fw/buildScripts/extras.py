from os.path import isfile
from os import makedirs
import shutil
Import("env")

def copy_firmware_files():
  print(f"- Copying firmware files for board {env['BOARD']}")

  VERSION_FILE=f"{env['BOARD']}_version.txt"
  DESTINATION=f'../server/firmware/{env["BOARD"]}/'
  ORIGIN=f".pio/build/{env['BOARD']}/firmware.bin"
  current_version = "0.0.1"

  with open(VERSION_FILE) as f:
    current_version = f.readline()
    makedirs(DESTINATION, exist_ok=True)
    shutil.copyfile(ORIGIN, DESTINATION + f'{current_version}.bin')
    shutil.copyfile(VERSION_FILE, DESTINATION + "latest.txt")

def bump_and_get_version():
  VERSION_FILE = f"{env['BOARD']}_version.txt"

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

def postBuild(source, target, env):
  print("Post-build actions...")
  copy_firmware_files()

load_env_variables()
env.AddPostAction("buildprog", postBuild)

