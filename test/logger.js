const Logger = require('../logger/index')

const logger = new Logger({
  prettyLog: false,
  customLevels: {
    customLevel: 2
  },
  logExt: {
    logType: 'type1'
  },
  notStringifyLevels: ['customLevel'],
  overwriteConsole: false
})

module.exports = logger
