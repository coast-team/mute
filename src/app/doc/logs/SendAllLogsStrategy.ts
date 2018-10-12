import { LogsStrategy } from './LogsStrategy'

export class SendAllLogsStrategy extends LogsStrategy {
  constructor(docKey: string) {
    super(docKey)
  }

  public setShareLogs(share: boolean, state: Map<number, number>) {
    super.setShareLogs(share, state)
    if (share) {
      this.sendAllLogs()
    }
  }

  public sendLogs(obj: object, share: boolean) {
    obj['logid'] = this.useLogId()
    this.dbLocal.store(obj)
    if (share) {
      this.dbDistante.send(obj)
    }
  }

  /**
   * This function will send all local logs to the distant database
   * We sort logs with timestamp, and send all operation which was done after the one with the store state vector (when we turn logs off)
   * There is cases where some connection and deconnection logs will not be sent
   * There is cases where a log will be sent twice (if we turn logs on and operation arrive before we've been able to retrieve local logs)
   */
  private sendAllLogs() {
    this.getLocalLogs().then((obj) => {
      const lastState = JSON.parse(window.localStorage.getItem('shareLogs-off-' + this.docKey))
      if (lastState === null) {
        obj.forEach((val, key) => {
          this.dbDistante.send(val)
        })
      } else {
        const sortedLogs = obj.sort((a, b) => a['timestamp'] - b['timestamp'])
        let send = false
        sortedLogs.forEach((value, key) => {
          if (send) {
            this.dbDistante.send(value)
          } else {
            if (['localInsertion', 'localDeletion', 'remoteInsertion', 'remoteDeletion'].includes(value['type'])) {
              let sameState = true
              const vector = value['context']
              Object.keys(lastState).forEach((siteId) => {
                const logSiteIdClock = vector[parseInt(siteId, 10)]
                if (logSiteIdClock !== lastState[siteId]) {
                  sameState = false
                  return
                }
              })
              if (sameState) {
                this.dbDistante.send(value)
                send = true
              }
            }
          }
        })
      }
    })
  }
}
