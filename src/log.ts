// Log frameworks configuration
const loglevel: any = log.noConflict()
BRAGI.transports.get('console').property('showMeta', false)

/**
 * Logging wrapper. Uses 2 frameworks:
 * - *BRAGI*: 'node_modules/bragi-browser/dist/bragi.min.js'
 * - *Loglevel*: 'node_modules/loglevel/dist/loglevel.min.js'
 *
 * Both are included into 'angular-cli.json' file and both declare global variables:
 * `log` and `BRAGI`.
 * This script is then imported into *app.module.ts*.
 */
export class Log {
  /**
   * Colored 'Debug' group log.
   * @param msg message
   * @param obj any javascript object
   */
  debug(msg: string, obj?: any): void {
    BRAGI.log('DEBUG:' + this.getTimestamp(), msg, obj)
  }

  /**
   * Colored log. Each group name has different color.
   * @param group group name
   * @param msg   message
   * @param obj   any javascript object
   */
  info(group: string, msg: string, obj?: any): void {
    BRAGI.log(group + ':' + this.getTimestamp(), msg, obj)
  }

  angular(msg: string, obj?: any) {
    this.info('ANGULAR', msg, obj)
  }

  /**
   * Browser native console.trace. Works in Chrome, but maybe not in other browsers.
   * @param msg   message
   * @param obj   any javascript object
   */
  trace(msg: string, obj?: any): void {
    loglevel.trace(this.prefix('TRACE') + msg, obj)
  }

  /**
   * Browser native console.warn (shows stack trace). Works in Chrome, but maybe
   * not well in other browsers.
   * @param msg   message
   * @param obj   any javascript object
   */
  warn(msg: string, obj?: any): void {
    loglevel.warn(this.prefix('WARN') + msg, obj)
  }

  /**
   * Browser native console.error (shows stack trace). Works in Chrome, but maybe
   * not well in other browsers.
   * @param msg   message
   * @param obj   any javascript object
   */
  error(msg: string, obj?: any): void {
    loglevel.error(this.prefix('ERROR') + msg, obj)
  }

  /**
   * Disable all log messages.
   */
  on(): void {
    BRAGI.options.groupsEnabled = true
    loglevel.enableAll()
  }

  /**
   * Enable all log messages.
   */
  off(): void {
    BRAGI.options.groupsEnabled = false
    loglevel.disableAll()
  }

  noConflict() {}

  private getTimestamp(): string {
    const now = new Date()
    return (
      `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T` +
      `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}Z`
    )
  }

  private prefix(prefix = ''): string {
    const timestamp = this.getTimestamp()
    if (prefix !== '') {
      return '[ ' + prefix + ':' + timestamp + '  ]  '
    } else {
      return '[ ' + timestamp + '  ]  '
    }
  }
}

function _window(): Window {
  /* tslint:disable: no-invalid-this */
  return typeof this === 'object' ? this : Function('return this')()
}

;(_window() as any).log = new Log()
