const hostname = require("os").hostname();
const winston = require("winston");
const format = require("./format");

const defaultLevels = {
  error: 0,
  warn: 1,
  info: 2,
  access: 2,
  verbose: 3,
  debug: 4,
  silly: 5
};

const defaultConfig = {
  wrapDepth: 0,
  level: "info",
  customLevels: {},
  transports: {
    file: false,
    console: true
  },
  format: format,
  overwriteConsole: true,
  logExt: {
    logType: ""
  },
  fileInfo: false,
  prettyLog: false,
  separator: "------------------------------",
  prettyLogOption: {},
  disable: false,
  notStringifyLevels: ["access"]
};

/** Class Logger */
class Logger {
  constructor(options = {}) {
    // 用于自定义日志文件信息时，作为默认的 fileInfo
    this.customFileInformation = "";

    // 兼容老版本的错误：notStringifyLevles拼写错误
    if (options.notStringifyLevles) {
      options.notStringifyLevels = options.notStringifyLevles;
    }
    options = Object.assign(defaultConfig, options);
    // access 类型的日志强制不能 stringify
    // 避免外部传递 notStringifyLevels 时，漏掉了 access
    if (options.notStringifyLevels.indexOf("access") < 0) {
      options.notStringifyLevels.push("access");
    }
    this.options = options;

    const levels = Object.assign(defaultLevels, options.customLevels);
    this.levels = levels;
    const format =
      typeof options.format === "string"
        ? winston.format[options.format]()
        : options.format(options, levels);

    const transports = [];
    if (options.transports.console) {
      transports.push(new winston.transports.Console());
    }
    if (options.transports.file) {
      transports.push(new winston.transports.File({ filename: options.transports.file }));
    }
    this.logger = winston.createLogger({
      level: options.level,
      levels,
      format,
      transports
    });
    Object.keys(levels).forEach(level => {
      // 注意，这里不能用箭头函数，
      // 避免 customFileInfo 时，this 仍旧指向父 logger 实例
      // 允许传多个msg
      this[level] = function(...msgs) {
        return this.log(level, msgs);
      };
    });
    if (options.overwriteConsole) {
      console.log = (...msgs) => {
        this.log("info", msgs);
      };
      console.info = (...msgs) => {
        this.log("info", msgs);
      };
      console.warn = (...msgs) => {
        this.log("warn", msgs);
      };
      console.error = (...msgs) => {
        this.log("error", msgs);
      };
      console.debug = (...msgs) => {
        this.log("debug", msgs);
      };
    }
  }
  log(level, msgs) {
    let fileInfo = this.customFileInformation;
    // 输出完整文件信息的条件：
    // 等级为 0 的日志，比如 error 等级的日志
    // 或者开启了 fileInfo
    if (this.options.fileInfo || this.levels[level] === 0) {
      // 如果外部继续对 logger 进行了封装
      // 获取 fileInfo时， 需要外部的封装次数
      const traceDepth = 3 + (this.options.wrapDepth || 0);
      const runTimeTrace = getStackTrace().split(/\n+/)[traceDepth];
      fileInfo = runTimeTrace
        .replace(process.cwd(), "")
        .replace(/(^\s+|\s+$)/, "")
        .replace(/(^.*?\()/, "")
        .replace(/(\)$)/, "");
      // 将自定义的 fileInfo 作为最终文件信息的前缀
      fileInfo = this.customFileInformation
        ? `[${this.customFileInformation}] ${fileInfo}`
        : fileInfo;
    }
    let resMsg;
    // 对于不进行 stringify 的 level，只取第一条
    // 也就是不进行 stringify 的 level 只能传一个参数
    if (this.options.notStringifyLevels.indexOf(level) > -1) {
      resMsg = msgs[0];
    } else {
      resMsg = msgs
        .map(item => {
          if (typeof item !== "string" && typeof item !== "number") {
            try {
              return JSON.stringify(item);
            } catch (err) {
              return "log parsing error";
            }
          }
          return item;
        })
        .join(" ");
    }
    const optionLogExt = this.options.logExt;
    const logExt =
      typeof optionLogExt === "function" ? optionLogExt() : optionLogExt;
    const log = Object.assign(logExt, {
      env: process.env.NODE_ENV,
      fileinfo: fileInfo,
      msg: resMsg,
      os_hostname: hostname
    });
    if (!this.options.disable) {
      this.logger.log(level, log);
    }
    return { level, ...log };
  }
  customFileInfo(fileInfo) {
    const cloneLogger = Object.create(this);
    cloneLogger.customFileInformation = fileInfo;
    return cloneLogger;
  }
}

module.exports = Logger;

function getStackTrace() {
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}
