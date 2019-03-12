const convertHrtime = require('convert-hrtime')
const format = require('./logger-format')

const defaultOptions = {
  requiredLogs: [
    'remote_addr',
    'method',
    'url',
    'http_version',
    'status',
    'referrer',
    'request_time',
    'perf',
    'user_agent'
  ],
  transform (logObj) {
    console.log(JSON.stringify(logObj))
  },
  filter () {
    return true
  }
}

/**
 * koa日志中间件
 * @function
 * @param {object} [options]
 * @param {string[]} [options.requiredLogs] - 需要输出的日志内容
 * @param {function} options.transform - 日志通过该函数输出
 * @param {function} options.filter - 日志过滤，返回false则过滤该条日志
 * @returns {function}
 */
function middleware (options = {}) {
  options = Object.assign({}, defaultOptions, options)
  return async function (ctx, next) {
    if (options.filter(ctx) === false) {
      await next()
      return
    }

    ctx.request.requestTime = Date.now()
    ctx.request.requestTimeNanoseconds = convertHrtime(process.hrtime()).nanoseconds
    try {
      await next()
      ctx.response.responseTime = Date.now()
      ctx.response.responseTimeNanoseconds = convertHrtime(process.hrtime()).nanoseconds
      options.transform(format(ctx, options.requiredLogs), ctx)
    } catch (error) {
      ctx.response.responseTime = Date.now()
      ctx.response.responseTimeNanoseconds = convertHrtime(process.hrtime()).nanoseconds
      // 不处理 ctx.status，交给 koa 处理
      // ctx.status = error.status || 500
      options.transform(format(ctx, options.requiredLogs, error.status || 500), ctx)
      throw error
    }
  }
}

module.exports = middleware
