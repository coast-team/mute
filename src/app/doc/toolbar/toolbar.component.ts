import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { DomSanitizer } from '@angular/platform-browser'
import { Subscription } from 'rxjs'

import { enableDebug } from '@coast-team/mute-crypto'
import { LogLevel, setLogLevel } from 'netflux'
import { environment } from '../../../environments/environment'
import { Doc } from '../../core/Doc'
import { BotStorageService } from '../../core/storage/bot/bot-storage.service'
import { UiService } from '../../core/ui/ui.service'
import { DocService } from '../doc.service'
import { LogsService } from '../logs/logs.service'
import { NetworkService } from '../network'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnDestroy {
  @Output()
  menu: EventEmitter<void>
  @Output()
  info: EventEmitter<void>
  @ViewChild('input')
  input: ElementRef
  @ViewChild('debugDownload')
  debugDownload: ElementRef

  public botNotAvailable: boolean
  public doc: Doc
  public debug: boolean
  public netfluxLog: LogLevel[]
  public cryptoLog: boolean
  public docLog: boolean
  public LogLevel = LogLevel

  private subs: Subscription[]
  private digest: string

  constructor(
    public docService: DocService,
    private sanitizer: DomSanitizer,
    private network: NetworkService,
    private botStorage: BotStorageService,
    private snackBar: MatSnackBar,
    private ui: UiService,
    private logs: LogsService
  ) {
    this.debug = environment.debug.visible
    this.netfluxLog = environment.debug.log.netflux
    this.updateNetfluxLog()
    this.cryptoLog = environment.debug.log.crypto
    this.updateCryptoLog()
    this.docLog = environment.debug.log.doc
    this.updateDocLog()
    this.menu = new EventEmitter()
    this.info = new EventEmitter()
    this.doc = docService.doc
    this.botNotAvailable = true
    this.subs = []
    this.subs.push(botStorage.onStatus.subscribe((code) => (this.botNotAvailable = code !== BotStorageService.AVAILABLE)))
    this.subs.push(this.ui.docDigest.subscribe((digest) => (this.digest = digest)))
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe())
  }

  updateTitle(event) {
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.input.nativeElement.blur()
    } else if (event.type === 'blur') {
      const newTitle = this.input.nativeElement.value
      this.doc.title = newTitle
      if (newTitle !== this.doc.title) {
        this.input.nativeElement.value = this.doc.title
      }
    }
  }

  selectTitle() {
    this.input.nativeElement.select()
  }

  inviteBot() {
    this.network.inviteBot(this.botStorage.wsURL)
  }

  updateNetfluxLog() {
    setLogLevel(...this.netfluxLog)
  }

  updateCryptoLog() {
    enableDebug(this.cryptoLog)
  }

  updateDocLog() {
    this.logs.setDisplayLogs(this.docLog)
  }

  stopPropagation(event: Event) {
    event.stopPropagation()
  }

  async downloadMuteLog() {
    try {
      const lines = (await this.logs.getLogs()).map((e) => JSON.stringify(e) + ',\n')
      lines[lines.length - 1] = lines[lines.length - 1].slice(0, lines[lines.length - 1].length - 2) + ']' // replace ",\n" athe end of the last line in order to obtain a correct JSON file
      this.download('mutelog', new Blob(['[', ...lines], { type: 'text/json' }))
    } catch (err) {
      log.warn('Unable to download MuteLog: ', err.message)
      this.snackBar.open('Unable to download MuteLog', 'Close')
    }
  }

  async downloadDocLog() {
    try {
      const blob = (await this.docService.doc.fetchContent(true)) as Blob | undefined
      if (blob) {
        this.download('doclog', blob)
      }
    } catch (err) {
      log.warn('Unable to get LOG: ', err.message)
      this.snackBar.open('Unable to download Document Log', 'Close')
    }
  }

  downloadDocTree() {
    if (this.ui.docTree) {
      this.download('doctree', new Blob([this.ui.docTree], { type: 'text/json' }))
    } else {
      log.warn('Tree is empty')
      this.snackBar.open(`Tree is empty. Nothing to download`, 'Close')
    }
  }

  private download(name: string, file: Blob) {
    const objectURL = URL.createObjectURL(file)
    const fileName = `${this.doc.signalingKey}_${name.toUpperCase()}_${this.digest}.json`

    // this.debugDownload.nativeElement.href = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL)
    this.debugDownload.nativeElement.href = objectURL
    this.debugDownload.nativeElement.download = fileName
    this.debugDownload.nativeElement.click()
  }
}
