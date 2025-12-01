const log = {
  i: (msg) => console.log(`- INFO - [${new Date().toUTCString()}] ${msg}`),
  w: (msg) => console.log(`- WARN - [${new Date().toUTCString()}] ${msg}`),
  e: (msg) => console.log(`- ERROR - [${new Date().toUTCString()}] ${msg}`),
}

export default log;