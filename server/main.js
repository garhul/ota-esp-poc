import express from 'express';

import log from './logger.js';
import * as versionManager from './versionManager.js'

const app = express();
app.use(express.json());

const port = 3000;

app.use((req, _res, next) => {
  log.i(`Request received: ${req.method} ${req.url}`);
  next();
});

/*
typedef device
@property {string} id
@property {string} userAgent
@property {string} board
@property {string} fwVersion
@property {string} sketchMD5
*/

/**
 * 
 * @param {Object} headers 
 * @returns {device} 
 */
function getDeviceFromHeaders(headers) {
  const userAgent = headers['user-agent'];

  switch (userAgent) {
    case 'ESP8266-http-Update':
      return {
        id: headers['x-esp8266-chip-id'],
        userAgent: headers['user-agent'],
        board: 'nodemcuv2',
        fwVersion: headers['x-esp8266-version'],
        sketchMD5: headers['x-esp8266-sketch-md5']
      }
      break;
    case 'ESP32-http-Update':
      return {
        id: headers['x-esp32-chip-id'],
        userAgent: headers['user-agent'],
        board: 'esp32-c3-devkitm-1',
        fwVersion: headers['x-esp32-version'],
        sketchMD5: headers['x-esp32-sketch-md5']
      }
      break;
    default:
      throw new Error(`Unsupported User-Agent: ${userAgent}`);
  }
}


app.get('/hasUpdates', async (req, res) => {
  try {
    log.i(`${JSON.stringify(req.headers)}`);
    const device = getDeviceFromHeaders(req.headers);

    if (!(await versionManager.canUpdate(device))) {
      log.i(`No update available for device: ${device.board}-${device.id}`);
      res.status(304);
      res.send();
      return;
    }

    const newFirmware = await versionManager.getLatestFirmware(device);

    res.status(200);
    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-Length', newFirmware.size);
    res.header('x-MD5', newFirmware.hash);
    res.header('x-version', newFirmware.version);
    res.send(newFirmware.binary);

  } catch (error) {
    log.e(`Error parsing device info: ${error.message}`);
    res.status(400).json({ error: error.message });
    return;
  }
});


app.listen(port, () => {
  log.i(`ESP OTA Repo server listening on port ${port}`);
})

