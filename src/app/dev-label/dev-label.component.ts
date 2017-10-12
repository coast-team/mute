import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer, ViewChild } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import 'rxjs/add/operator/toPromise'
import { hash } from '../../lastcommithash'

import * as mnemonic from 'mnemonicjs'

import { UiService } from '../core/ui/ui.service'
import { WindowRefService } from '../core/WindowRefService'

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
    private renderer: Renderer,
    private ui: UiService,
    private detectRef: ChangeDetectorRef,
    private windowRef: WindowRefService
  ) {
    this.nbOfDetectChanges = 0
    this.url += hash
    this.shortID = (hash as any).substr(0, 7)
  }

  ngOnInit (): void {
    this.ui.onDocDigest.subscribe((digest: number) => {
      this.digest = mnemonic.encode_int32(digest)
      this.detectRef.detectChanges()
      // log.debug("Current digest " + this.digest)
    })

    this.ui.onDocTree.subscribe((tree: string) => {
      this.tree = tree
    })
  }

  exportLog (): void {
    const urlParts: string[] = this.windowRef.window.location.href.split('/')
    const docID = urlParts[urlParts.length - 1]
    this.filename = `log-${docID}-${this.digest}.json`
    const db = jIO.createJIO({ type: 'query',  sub_storage: { type: 'indexeddb', database: 'mute' } })
    db.getAttachment(docID, 'body').then((body) => {
      this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(body))
      const clickEvent = new MouseEvent('click')
      this.detectRef.detectChanges()

      this.renderer.invokeElementMethod(this.link.nativeElement, 'dispatchEvent', [clickEvent])
    })
  }

  exportTree (): void {
    const urlParts: string[] = this.windowRef.window.location.href.split('/')
    const docID = urlParts[urlParts.length - 1]
    this.filename = `tree-${docID}-${this.digest}.json`
    const blob = new Blob([this.tree], { type : 'text\/json' })
    this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))
    this.detectRef.detectChanges()

    const clickEvent = new MouseEvent('click')
    this.renderer.invokeElementMethod(this.link.nativeElement, 'dispatchEvent', [clickEvent])
  }

  detectChangesRun () {
    this.detectChanges.nativeElement.innerHTML = ++this.nbOfDetectChanges
    return false
  }

}
