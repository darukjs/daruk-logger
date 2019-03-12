const { format } = require('winston')
const { combine, printf } = format
const prettyjson = require('prettyjson')

module.exports = function (options) {
  return combine(
    printf((info) => {
      info.timestamp = Date.now()
      const msg = flatObj({}, info)
      return options.prettyLog ? `${prettyjson.render(msg)}\n${options.separator}` : JSON.stringify(msg)
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
