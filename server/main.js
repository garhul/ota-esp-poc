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


/**
 * /**
[User-Agent] => ESP8266-http-Update
[x-ESP8266-STA-MAC] => 18:FE:AA:AA:AA:AA
[x-ESP8266-AP-MAC] => 1A:FE:AA:AA:AA:AA
[x-ESP8266-free-space] => 671744
[x-ESP8266-sketch-size] => 373940
[x-ESP8266-sketch-md5] => a56f8ef78a0bebd812f62067daf1408a
[x-ESP8266-chip-size] => 4194304
[x-ESP8266-sdk-version] => 1.3.0
[x-ESP8266-version] => DOOR-7-g14f53a19
[x-ESP8266-mode] => sketch
 */

app.get('/hasUpdates/:deviceModel', async (req, res) => {
  const deviceModel = req.params.deviceModel;
  if (!(req.headers['user-agent'] === 'ESP8266-http-Update')) {
    res.status(400).json({ error: 'Invalid User-Agent, only ESP8266-http-Update is allowed' });
    return;
  }

  const fwVersion = req.headers['x-esp8266-version'];
  const chipId = req.headers['x-esp8266-chip-id'];
  const sketchMD5 = req.headers['x-esp8266-sketch-md5'];

  log.i(`Update check, device: ${deviceModel}-${chipId}, fw: ${fwVersion}`);
  log.i(`Request headers: ${JSON.stringify(req.headers)}`);

  if (!(await versionManager.canUpdate(deviceModel, fwVersion, sketchMD5))) {
    log.i(`No update available for device: ${deviceModel}-${chipId}`);
    res.status(304);
    res.send();
    return;
  }

  const newFirmware = await versionManager.getLatestFirmware(deviceModel);

  res.status(200);
  res.header('Content-Type', 'application/octet-stream');
  // res.header('Content-Disposition', `attachment; filename=${path.basename(fwPath)}`);
  res.header('Content-Length', newFirmware.size);
  res.header('x-MD5', newFirmware.hash);
  res.header('x-version', newFirmware.version);
  res.send(newFirmware.binary);

});


app.listen(port, () => {
  log.i(`Example app listening on port ${port}`);
})

