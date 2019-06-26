interface middlewareOptions {
  requiredLogs?: Array<string>;
  transform?: Function;
  filter?: Function;
}

interface loggerOptions {
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

declare namespace koaLogger {
  export function middleware(options: middlewareOptions): Function;
  export class logger {
    constructor(options: loggerOptions);
    options: loggerOptions;
    logger: object;
    log: (
      level: string,
      msg: Array<string | object>,
      meta?: object,
      isTop?: boolean
    ) => any;
    customFileInfo: (msg: string) => any;
    [key: string]: any;
  }
}

export = koaLogger;
