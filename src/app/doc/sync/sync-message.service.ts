import { Injectable } from '@angular/core'
import { IdentifierInterval, LogootSDel, LogootSAdd } from 'mute-structs'
import { Observable } from 'rxjs'

import { NetworkService } from 'doc/network'
import { RichLogootSOperation } from './RichLogootSOperation'

const pb = require('./sync_pb.js')

@Injectable()
export class SyncMessageService {

  constructor (private network: NetworkService) {}

  set localRichLogootSOperationSource (source: Observable<RichLogootSOperation>) {
    source.subscribe((richLogootSOp: RichLogootSOperation) => {
      const msg = this.generateRichLogootSOpMsg(richLogootSOp)
      this.network.newSend(this.constructor.name, msg.serializeBinary())
    })
  }

  generateRichLogootSOpMsg (richLogootSOp: RichLogootSOperation): any {
    const msg = new pb.RichLogootSOperation()
    msg.setId(richLogootSOp.id)
    msg.setClock(richLogootSOp.clock)

    const logootSOp: LogootSAdd | LogootSDel = richLogootSOp.logootSOp
    let logootSOpMsg: any
    if (logootSOp instanceof LogootSAdd) {
      logootSOpMsg = this.generateLogootSAddMsg(logootSOp)
    } else if (logootSOp instanceof LogootSDel) {
      logootSOpMsg = this.generateLogootSDelMsg(logootSOp)
    }
    msg.setLogootSop(logootSOpMsg)

    return msg
  }

  generateLogootSAddMsg (logootSAdd: LogootSAdd): any {
    const identifier = new pb.Identifier()

    identifier.setBaseList(logootSAdd.id.base)
    identifier.setLast(logootSAdd.id.last)

    const logootSAddMsg = new pb.LogootSAdd()
    logootSAddMsg.setId(identifier)
    logootSAddMsg.setContent(logootSAdd.l)

    return logootSAddMsg
  }

  generateLogootSDelMsg (logootSDel: LogootSDel): any {
    const lid: any[] = logootSDel.lid.map( (id: any) => {
      const identifierInterval: any = this.generateIdentifierIntervalMsg(id)
      return identifierInterval
    })

    const logootSDelMsg = new pb.LogootSDel()
    logootSDelMsg.setLidList(lid)
    return logootSDelMsg
  }

  generateIdentifierIntervalMsg (id: IdentifierInterval): any {
    const identifierIntervalMsg = new pb.IdentifierInterval()

    identifierIntervalMsg.setBaseList(id.base)
    identifierIntervalMsg.setBegin(id.begin)
    identifierIntervalMsg.setEnd(id.end)

    return identifierIntervalMsg
  }

}
