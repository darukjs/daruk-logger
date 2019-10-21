const { format } = require('winston')
const { combine, printf } = format
const prettyjson = require('prettyjson')

module.exports = function (options, levels) {
  return combine(
    printf((info) => {
      info.timestamp = Date.now()
      const msg = flatObj({}, info)

      const renderOptions = {}
      // 高亮错误日志
      if (levels[msg.level] === 0) {
        renderOptions.keysColor = 'red'
      } else if (levels[msg.level] === 1) {
        // 高亮警告日志
        renderOptions.keysColor = 'yellow'
      }

      return options.prettyLog ? `${prettyjson.render(msg, renderOptions)}\n${options.separator}` : JSON.stringify(msg)
    })
  )
}

function flatObj (res, obj) {
  Object.keys(obj).forEach((key) => {
    if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
      flatObj(res, obj[key])
    } else {
      res[key] = obj[key]
    }
  })
  return res
}
