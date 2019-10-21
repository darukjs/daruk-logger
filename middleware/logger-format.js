const prefixNum = (num) => num > 9 ? `${num}` : `0${num}`

const formatTime = (date) => {
  return `${date.getFullYear()}-${prefixNum(date.getMonth() + 1)}-${prefixNum(date.getDate())} ${prefixNum(date.getHours())}:${prefixNum(date.getMinutes())}:${prefixNum(date.getSeconds())}`
}

module.exports = function (ctx, requiredLogs, errorStatusCode) {
  const loggers = {
    'time' () {
      return '[ ' + formatTime(new Date()) + ' ]'
    },
    'url' () {
      return ctx.originalUrl
    },
    'protocol' () {
      return ctx.protocol
    },
    'hostname' () {
      return ctx.hostname
    },
    'method' () {
      return ctx.method
    },
    'status' () {
      // 如果有错误状态码，以错误状态码为准
      return errorStatusCode || ctx.response.status || ctx.response.__statusCode || ctx.res.statusCode
    },
    'response_time' () {
      return ctx.response.responseTime || 0
    },
    'request_time' () {
      return ctx.request.requestTime || 0
    },
    'perf' () {
      return (ctx.response.responseTimeNanoseconds - ctx.request.requestTimeNanoseconds) / 1000000 || 0
    },
    'date' () {
      return new Date().toUTCString()
    },
    'referrer' () {
      return `"${ctx.headers.referer || ''}"`
    },
    'http_version' () {
      return 'HTTP/' + ctx.req.httpVersionMajor + '.' + ctx.req.httpVersionMinor
    },
    'remote_addr' () {
      return ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
      (ctx.socket && (ctx.socket.remoteAddress || (ctx.socket.socket && ctx.socket.socket.remoteAddress)))
    },
    'user_agent' () {
      return `"${ctx.headers['user-agent']}"`
    },
    'content_length' () {
      return (ctx.response._headers && ctx.response._headers['content-length']) ||
      (ctx.response.__headers && ctx.response.__headers['Content-Length']) ||
      ctx.response.length || '-'
    },
    'req' (key) {
      return ctx.headers[key]
    },
    'res' (key) {
      return ctx.response._headers
        ? (ctx.response._headers[key] || ctx.response.__headers[key])
        : (ctx.response.__headers && ctx.response.__headers[key])
    }
  }

  const res = {}
  requiredLogs.forEach((key) => {
    if (/\./.test(key)) {
      const splitKey = key.split('.')
      res[key] = loggers[splitKey[0]] && loggers[splitKey[0]](splitKey[1])
    } else {
      res[key] = loggers[key] && loggers[key]()
    }
  })
  return res
}
