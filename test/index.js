const logger = require('./logger')

const customLogger = logger.customFileInfo('[test]')

customLogger.access({ test3: 33, test1: 66 })
customLogger.customLevel({
  remote_addr: '127.0.0.1',
  method: 'POST',
  url: '/report?aaa',
  http_version: 'HTTP/1.1',
  status: 204,
  referrer: '""',
  request_time: 1548040958123,
  perf: 3.465514,
  user_agent: '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3642.0 Safari/537.36"',
  msg: '"123"'
})
