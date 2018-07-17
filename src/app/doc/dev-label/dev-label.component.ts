import { Component, DoCheck, ElementRef, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import * as mnemonic from '@coast-team/mnemonicjs'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { UiService } from '../../core/ui/ui.service'
import { DocService } from '../doc.service'
import { LogsService } from '../logs/logs.service'

@Component({
  selector: 'mute-dev-label',
  template: `
    <div class="mat-caption">
      <br />{{changes}} | Digest: {{digest | async}}
      <br /> Exports:
      <button (click)="exportMuteLog()">MuteLog</button>
      <button (click)="exportLog()">Log</button>
      <button (click)="exportTree()">Tree</button>
      <a #link [href]="objectURL" [download]="filename"></a>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        display: inline-block;
        min-width: 180px;
        bottom: 10px;
        right: 10px;
        z-index: 100;
        color: var(--theme-fg-hint-text);
      }
      button {
        padding: 2px 3px;
      }
    `,
  ],
})
export class DevLabelComponent implements DoCheck {
  @ViewChild('link') link: ElementRef

  public changes: number
  public digest: Observable<string>
  public objectURL: SafeResourceUrl
  public filename: string
  public key: string

  constructor(
    private sanitizer: DomSanitizer,
    private ui: UiService,
    private docService: DocService,
    private snackBar: MatSnackBar,
    private logs: LogsService
  ) {
    this.changes = 0
    this.key = docService.doc.signalingKey
    this.digest = this.ui.docDigest.pipe(map((digest: number) => mnemonic.encode_int32(digest)))
  }

  ngDoCheck() {
    this.changes++
  }

  async exportMuteLog(): Promise<void> {
    try {
      const obj = (await this.logs.getLogs()).map((e) => JSON.stringify(e) + '\n')
      const blob: Blob = new Blob(obj)
      this.updateFileName('mutelog')
      this.updateObjectURL(blob)
      this.link.nativeElement.click()
    } catch (err) {
      log.warn('Unable to download MuteLog: ', err.message)
      this.snackBar.open('Unable to download MuteLog', 'Close')
    }
  }

  async exportLog(): Promise<void> {
    try {
      const blob = (await this.docService.doc.fetchContent(true)) as Blob | undefined
      if (blob) {
        this.updateFileName('log')
        this.updateObjectURL(blob)
        this.link.nativeElement.click()
      }
    } catch (err) {
      log.warn('Unable to get LOG: ', err.message)
      this.snackBar.open('Unable to download Document Log', 'Close')
    }
  }

  exportTree(): void {
    if (this.ui.docTree) {
      const blob = new Blob([this.ui.docTree], { type: 'text/json' })
      this.updateFileName('tree')
      this.updateObjectURL(blob)
      this.link.nativeElement.click()
    } else {
      log.warn('Tree is empty')
      this.snackBar.open(`Tree is empty. Nothing to download`, 'Close')
    }
  }

  private updateObjectURL(blob: Blob): void {
    const objectURL = URL.createObjectURL(blob)
    this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL)
  }

  private updateFileName(prefix: string) {
    this.filename = `${prefix}-${this.key}-${this.digest}.json`
  }
}
