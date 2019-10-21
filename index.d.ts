interface IMiddlewareOptions {
  requiredLogs?: Array<string>;
  transform?: Function;
  filter?: Function;
}

interface ILoggerOptions {
  wrapDepth?: number;
  level?: string;
  customLevels?: object;
  transports?: object;
  format?: Function;
  overwriteConsole?: boolean;
  logExt?: object | Function;
  disable?: boolean;
  fileInfo?: boolean;
  separator?: string;
  prettyLog?: boolean;
  prettyLogOption?: object;
  // 兼容老版本的错误：notStringifyLevles拼写错误
  notStringifyLevles?: Array<string>;
  notStringifyLevels?: Array<string>;
}

type logReturns = {
  level: string;
  [key:string]: any
};
type logFunc = (...msg: Array<string | object>) => logReturns;

declare namespace koaLogger {
  export function middleware(options: IMiddlewareOptions): Function;
  export class logger {
    constructor(options: ILoggerOptions);
    options: ILoggerOptions;
    logger: object;
    log: (
      level: string,
      msg: Array<string | object>,
      meta?: object,
      isTop?: boolean
    ) => logReturns;
    customFileInfo: (msg: string) => this;
    error: logFunc;
    warn: logFunc;
    info: logFunc;
    access: logFunc;
    verbose: logFunc;
    debug: logFunc;
    silly: logFunc;
    [key: string]: any;
  }
}

export = koaLogger;
