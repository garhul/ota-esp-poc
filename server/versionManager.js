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


/**
 * Verifies if there's an update for the given device and firmware version
 * @param {string} deviceModel 
 * @param {string} currentVersion 
 * @param {string} sketchMD5 
 * @returns {boolean}
 */
export async function canUpdate(deviceModel, currentVersion, sketchMD5) {
  const version = fs.readFileSync(path.join(__dirname, 'firmware', deviceModel, 'latest.txt'), 'utf8').trim();
  const hash = await getFileMD5(path.join(__dirname, 'firmware', deviceModel, `${version}.bin`));

  if (isOutdated(currentVersion, version) && (sketchMD5 !== hash)) return true;

  return false;
}

/**
 * Retrieves the latest firmware version for the given device model
 * @param {string} deviceModel
 * @returns {Promise<{ latestVersion: string, hash: string , size:number, binary:Buffer, version:string }>}
 */
export async function getLatestFirmware(deviceModel) {
  // Implement logic to retrieve the latest firmware version for the given device model
  // This could involve checking a database, a file, or an external API

  const version = fs.readFileSync(path.join(__dirname, 'firmware', deviceModel, 'latest.txt'), 'utf8').trim();
  const fwPath = path.join(__dirname, 'firmware', deviceModel, `${version}.bin`);
  log.i(`Firmware path: ${fwPath}`);

  const size = fs.statSync(fwPath).size;
  const binary = fs.readFileSync(fwPath);
  const hash = await getFileMD5(fwPath);

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