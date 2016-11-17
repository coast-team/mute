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
class Log {
  /**
   * Colored 'Debug' group log.
   * @param {string} msg message
   * @param {any}    obj any javascript object
   */
  debug (msg: string, obj?: any): void {
    BRAGI.log('DEBUG:' + this.getTimestamp(), msg, obj)
  }

  /**
   * Colored log. Each group name has different color.
   * @param {string} group group name
   * @param {string} msg   message
   * @param {any}    obj   any javascript object
   */
  info (group: string, msg: string, obj?: any): void {
    BRAGI.log(group + ':'  + this.getTimestamp(), msg, obj)
  }

 /**
  * Browser native console.trace. Works in Chrome, but maybe not in other browsers.
  * If 2 arguments: the first is a group name and the second is message.
  * If 1 argument then it is a message.
  * @param {[type]} ...params 1 or 2 arguments
  */
  trace (...params): void {
    if (params.length === 2) {
      loglevel.trace(this.prefix(params[0]) + params[1])
    } else {
      loglevel.trace(this.prefix('TRACE') + params[0])
    }
  }

  /**
   * Browser native console.warn (shows stack trace). Works in Chrome, but maybe
   * not well in other browsers.
   * If 2 arguments: the first is a group name and the second is a message.
   * If 1 argument then it is a message.
   * @param {[type]} ...params 1 or 2 arguments
   */
  warn (...params): void {
    if (params.length === 2) {
      loglevel.warn(this.prefix('WARN:' + params[0]) + params[1])
    } else {
      loglevel.warn(this.prefix('WARN:') + params[0])
    }
  }

  /**
   * Browser native console.error (shows stack trace). Works in Chrome, but maybe
   * not well in other browsers.
   * If 2 arguments: the first is a group name and the second is a message. 
   * If 1 argument then it is a message.
   * @param {[type]} ...params 1 or 2 arguments
   */
  error (...params): void {
    if (params.length === 2) {
      loglevel.error(this.prefix('ERROR:' + params[0]) + params[1])
    } else {
      loglevel.error(this.prefix('ERROR:') + params[0])
    }
  }

  /**
   * Disable all log messages.
   */
  on (): void {
    BRAGI.options.groupsEnabled = true
    loglevel.enableAll()
  }

  /**
   * Enable all log messages.
   */
  off (): void {
    BRAGI.options.groupsEnabled = false
    loglevel.disableAll()
  }

  noConflict() {}

  private getTimestamp (): string {
    let now = new Date()
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T`
      + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}Z`
  }

  private prefix (prefix = ''): string {
    let timestamp = this.getTimestamp()
    if (prefix !== '') {
      return '[ ' + prefix + ':' + timestamp + '  ]  '
    } else {
      return '[ ' + timestamp + '  ]  '
    }
  }
}

(window as any).log = new Log()
