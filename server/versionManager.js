import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import log from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isOutdated(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const currentVer = currentParts[i] || 0;
    const latestVer = latestParts[i] || 0;

    if (currentVer < latestVer) return true;
    if (currentVer > latestVer) return false;
  }

  return false;
}

function getVersionLock(deviceId) {
  const versionLock = JSON.parse(fs.readFileSync(path.join(__dirname, 'versionLock.json'), 'utf8'));
  return versionLock[deviceId] || null;
}

/**
 * Verifies if there's an update for the given device and firmware version
 * @param {import('./main.js').device} device
 * @returns {boolean}
 */
export async function canUpdate(device) {
  const { id, fwVersion, sketchMD5, board } = device;

  const versionLock = getVersionLock(id);

  if (versionLock && versionLock.locked) {
    log.i(`Device ${id} is locked to version ${versionLock.version}`);
    return false;
  }

  const latestAvailableVersion = fs.readFileSync(path.join(__dirname, 'firmware', board, 'latest.txt'), 'utf8').trim();
  const hash = await getFileMD5(path.join(__dirname, 'firmware', board, `${latestAvailableVersion}.bin`));

  if (sketchMD5 === hash)
    return false;

  if (!isOutdated(fwVersion, latestAvailableVersion))
    return false;

  return true;
}

function bumpVersionLock(deviceId, version) {
  const versionLock = JSON.parse(fs.readFileSync(path.join(__dirname, 'versionLock.json'), 'utf8'));

  if (versionLock[deviceId] && versionLock[deviceId].locked) {
    log.w(`Attempted to bump version from ${versionLock[deviceId].version} to ${version} of locked device ${deviceId}`);
    return;
  }

  versionLock[deviceId] = {
    version,
    lock: false,
    lastUpdate: new Date().toISOString()
  };

  fs.writeFileSync(path.join(__dirname, 'versionLock.json'), JSON.stringify(versionLock, null, 2));
}

/**
 * Retrieves the latest firmware version for the given device board
 * @param {Object} device
 * @returns {Promise<{ latestVersion: string, hash: string , size:number, binary:Buffer, version:string }>}
 */
export async function getLatestFirmware(device) {
  const { id, board } = device;

  // Implement logic to retrieve the latest firmware version for the given device board
  // This could involve checking a database, a file, or an external API

  const version = fs.readFileSync(path.join(__dirname, 'firmware', board, 'latest.txt'), 'utf8').trim();
  const fwPath = path.join(__dirname, 'firmware', board, `${version}.bin`);
  log.i(`Firmware path: ${fwPath}`);

  const size = fs.statSync(fwPath).size;
  const binary = fs.readFileSync(fwPath);
  const hash = await getFileMD5(fwPath);

  bumpVersionLock(id, version);

  return {
    size,
    hash,
    binary,
    version
  }

}

async function getFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

