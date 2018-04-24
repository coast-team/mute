import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import * as mnemonic from '@coast-team/mnemonicjs'

import { LocalStorageService } from '../../core/storage/local/local-storage.service'
import { UiService } from '../../core/ui/ui.service'
import { LogsService } from '../logs/logs.service'

@Component({
  selector: 'mute-dev-label',
  template: `
    <div class="mat-caption">
      <br /> Digest: {{digest}}
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
export class DevLabelComponent implements OnInit {
  @ViewChild('link') link: ElementRef
  private tree: string

  public digest: string
  public objectURL: SafeResourceUrl
  public filename: string

  constructor(
    private sanitizer: DomSanitizer,
    private ui: UiService,
    private detectRef: ChangeDetectorRef,
    private storageService: LocalStorageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ui.onDocDigest.subscribe((digest: number) => {
      this.digest = mnemonic.encode_int32(digest)
      this.detectRef.detectChanges()
    })

    this.ui.onDocTree.subscribe((tree: string) => {
      this.tree = tree
    })
  }

  private updateObjectURL(blob: Blob): void {
    const objectURL = URL.createObjectURL(blob)
    this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL)
    this.detectRef.detectChanges()
  }

  async exportMuteLog(): Promise<void> {
    const urlParts: string[] = window.location.href.split('/')
    const docID = urlParts[urlParts.length - 1]
    try {
      const log = new LogsService('muteLogs-' + docID)
      const obj = (await log.getLogs()).map((e) => JSON.stringify(e) + '\n')
      const blob: Blob = new Blob(obj)
      this.filename = `log-${docID}-${this.digest}.json`
      this.updateObjectURL(blob)
      this.link.nativeElement.click()
    } catch (error) {
      const message = `The log could not be retrieved: ${error}.`
      const action = 'Close'
      this.snackBar.open(message, action)
    }
  }

  async exportLog(): Promise<void> {
    const urlParts: string[] = window.location.href.split('/')
    const docID = urlParts[urlParts.length - 1]
    try {
      const blob = await this.storageService.getDocBodyAsBlob(docID)
      this.filename = `log-${docID}-${this.digest}.json`
      this.updateObjectURL(blob)
      this.link.nativeElement.click()
    } catch (error) {
      const message = `The log could not be retrieved: ${error}.`
      const action = 'Close'
      this.snackBar.open(message, action)
    }
  }

  exportTree(): void {
    if (this.tree !== undefined) {
      const urlParts: string[] = window.location.href.split('/')
      const docID = urlParts[urlParts.length - 1]
      const blob = new Blob([this.tree], { type: 'text/json' })
      this.filename = `tree-${docID}-${this.digest}.json`
      this.updateObjectURL(blob)
      this.link.nativeElement.click()
    } else {
      const error = new Error('Tree is empty')
      const message = `The tree could not be retrieved: ${error}.`
      const action = 'Close'
      this.snackBar.open(message, action)
    }
  }
}
