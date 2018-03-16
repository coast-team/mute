import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core'
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import * as mnemonic from '@coast-team/mnemonicjs'
import 'rxjs/add/operator/toPromise'

import { hash } from '../../lastcommithash'
import { LocalStorageService } from '../core/storage/local/local-storage.service'
import { UiService } from '../core/ui/ui.service'

@Component({
  selector: 'mute-dev-label',
  template: `
    Preview version: <a [href]='url' target="_blank" rel="noopener">{{shortID}}</a>
    <br />
    Digest: {{digest}}
    <br />
    Changes: <span #detectChanges>0</span>
    <br />
    Exports: <button (click)="exportLog()">Log</button> <button (click)="exportTree()">Tree</button>
    <a #link [href]="objectURL" [download]="filename">
    <br *ngIf="detectChangesRun()" />
    `,
  styles: [`
    :host {
      position: fixed;
      font-size: 1.1rem;
      bottom: 20px;
      right: 20px;
      z-index: 100;
    }
    button {
      padding: 0;
    }
  `]
})
export class DevLabelComponent implements OnInit {

  @ViewChild('link') link: ElementRef
  @ViewChild('detectChanges') detectChanges: ElementRef
  private tree: string

  public url = 'https://github.com/coast-team/mute/tree/'
  public shortID: string
  public digest: string
  public objectURL: SafeResourceUrl
  public filename: string
  public nbOfDetectChanges: number

  constructor (
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private ui: UiService,
    private detectRef: ChangeDetectorRef,
    private storageService: LocalStorageService,
    private snackBar: MatSnackBar
  ) {
    this.nbOfDetectChanges = 0
    this.url += hash
    this.shortID = (hash as any).substr(0, 7)
  }

  ngOnInit (): void {
    this.ui.onDocDigest.subscribe((digest: number) => {
      this.digest = mnemonic.encode_int32(digest)
      this.detectRef.detectChanges()
    })

    this.ui.onDocTree.subscribe((tree: string) => {
      this.tree = tree
    })
  }

  private updateObjectURL (blob: Blob): void {
    const objectURL = URL.createObjectURL(blob)
    this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(objectURL)
    this.detectRef.detectChanges()
  }

  async exportLog (): Promise<void> {
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

  exportTree (): void {
    if (this.tree !== undefined) {
      const urlParts: string[] = window.location.href.split('/')
      const docID = urlParts[urlParts.length - 1]
      const blob = new Blob([this.tree], { type : 'text\/json' })
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

  detectChangesRun () {
    this.detectChanges.nativeElement.innerHTML = ++this.nbOfDetectChanges
    return false
  }

}
