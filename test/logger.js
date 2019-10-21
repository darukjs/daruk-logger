const Logger = require('../logger/index')

const logger = new Logger({
  prettyLog: true,
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
