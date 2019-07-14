## daruk-logger

### 安装
```bash
yarn add daruk-logger
```

### 使用logger
```javascript
const Logger = require('daruk-logger').logger
const prod = process.env.NODE_ENV === 'prod'

const logger = new Logger({ 
  // log等级，超过该级别的日志不会输出
  level: prod ? 'info' : 'silly',
  // 自定义log等级，
  // 定义后，可以使用logger.customAccess('log')输出日志
  customLevels: {
    customAccess: 2
  },
  prettyLog: !prod,
  fileInfo: !prod
})

logger.info('msg')
logger.access('msg')
logger.warn('msg')
logger.error('msg')
// 也支持传递多个日志 msg 参数，输出的日志使用一个空格分隔多个 msg
logger.info('msg1', 'msg2', 'msg3')
logger.warn('msg1', 'msg2')
```

#### 自定义日志 fileinfo
error 等级的日志的 fileinfo 字段为输出日志的文件路径，出于性能考虑，非 error 等级日志的 fileinfo 字段默认为空，但有时候希望更好地追踪其他等级的日志。  
因此提供了`customFileInfo`方法，该方法返回一个新的logger对象，通过该对象输出的日志，fileinfo 字段都是设置的文件信息

```javascript
// logger.js
const logger = new Logger({})

module.exports = logger
```

```javascript
// my-controller.js
const logger = require('./logger.js').customFileInfo('[my-controller]')

logger.info('msg')
// 输出日志的fileinfo：[my-controller]
logger.warn('msg')
// 输出日志的fileinfo：[my-controller]
```

#### 封装深度
有时候，可能需要对 logger 做一次封装，也就是先调用自定义 logger 函数，再在自定义 logger 函数中调用 daruk-logger，这时 daruk-logger 会获取到错误的 fileinfo，解决方式是传递 `options.wrapDepth` 参数：

```javascript
const Logger = rquire('daruk-logger').logger

const logger = new Logger({
  // 因为这里封装了一次，所以 wrapDepth 传 1
  wrapDepth: 1
})

const myLogger = {
  info (msg) {
    logger.info(meg)
  }
}
```

需要注意，如果只是覆写 daruk-logger 的方法，不需要传 `options.wrapDepth` 参数：

```javascript
const Logger = rquire('daruk-logger').logger

const logger = new Logger()
const info = logger.info
logger.info = function (msg) {
  info(msg)
}
```


#### 配置options说明

| 选项 | 默认值 | 描述 | 其他 |
|----------|----------|----------|----------|
| options.level | info | log等级，log等级，超过该级别的日志不会输出 | 内置的日志等级：{ error: 0, warn: 1, info: 2, access: 2, verbose: 3, debug: 4, silly: 5 } |
| options.customLevels | {} | 自定义log等级 | 定义后，可以使用logger.levelName('log')输出日志
| options.transports.file | '' | 输出日志文件的路径，如：/var/log/node-app/app.log | 注意，日志文件不会自动进行切割，建议线上时，根据公司运维场景，决定最终的日志处理方式（保存到文件或者发送到日志中心），[#2](https://github.com/darukjs/daruk-logger/issues/2#issuecomment-511185387) |
| options.transports.console | true | 使用console输出日志 | - | 
| options.overwriteConsole | false | 是否覆写console对象上的方法 | - | 
| options.logExt | {} | 加到日志中的额外信息，可以为一个函数，函数需要返回一个key-value对象 | 比如，添加 { logType: "app1" } 后，每条日志都会添加 logType 字段 |
| options.notStringifyLevles | ['access'] | 不对日志的 msg 进行 JSON.stringify 的日志等级 | 注意，设置为 notStringifyLevles 后，该等级的日志方法不支持传递多个 msg 参数 |
| options.disable | false | 禁用日志输出 | - |
| options.wrapDepth | 0 | 外部的封装深度 | - |
| options.fileInfo | false | 在开发环境下，输出打印日志的文件信息 | 影响性能，不要在线上环境使用 |
| options.prettyLog | false | 在开发环境下美化日志输出 | 不要在线上环境使用 |
| options.separator | ------------------------ | 美化日志时，用于分割每条日志 | - |
| options.prettyLogOption | {} | 美化日志选项 | https://www.npmjs.com/package/prettyjson |


### 使用中间件
```javascript
// 在 daruk 中已经默认使用了该中间件
const loggerMiddleware = require('daruk-logger').middleware

// 需要在所有中间件之前，使用该中间件，这样才能取到更加准确的响应时间
server.use(loggerMiddleware({
  transform (logObj, ctx) {
    console.log(JSON.stringify(logObj))
    logger.access(logObj)
  },
  filter (ctx) {
    return true
  }
}))
// 其他中间件
// server.use(json()).use(cors())
// server.use(router.routes()).use(router.allowedMethods())
```
#### 配置options说明
| 选项 | 类型 | 描述 |
| --- | --- | --- |
| options.transform | <code>function</code> | 日志通过该函数输出，第一个参数为日志内容对象，第二个参数为koa context |
| [options.filter] | <code>function</code> | 日志过滤，返回false则过滤该条日志，参数为koa context |
| [options.requiredLogs] | <code>string[]</code> | 需要输出的日志内容 |

options.requiredLogs默认值为:
```JavaScript
['remote_addr','method','url','http_version','status','referrer','request_time','perf','user_agent']
```  
支持的日志内容有：
```JavaScript
['time','url','protocol','hostname','method','status','response_time','request_time','perf', 'date', 'referrer', 'http_version', 'remote_addr', 'user_agent', 'content_length', 'req', 'res']
```  
