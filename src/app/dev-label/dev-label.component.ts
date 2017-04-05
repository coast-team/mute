import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer, ViewChild } from '@angular/core'
import { Http } from '@angular/http'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

import 'rxjs/add/operator/toPromise'

import { UiService } from '../core/ui/ui.service'

import * as mnemonic from 'mnemonicjs'

@Component({
  selector: 'mute-dev-label',
  template: `
    Preview version: <a [href]='url' target="_blank">{{shortID}}</a>
    <br>
    Digest: {{digest}}
    <br>
    Exports: <button (click)="exportLog()">Log</button> <button (click)="exportTree()">Tree</button>
    <a #link [(href)]="objectURL" [download]="filename">
    `,
  styles: [`
    :host {
      position: fixed;
      font-size: 1.1rem;
      bottom: 20px;
      right: 20px;
    }
  `]
})
export class DevLabelComponent implements OnInit {

  @ViewChild('link') link: ElementRef

  url = 'https://github.com/coast-team/mute/tree/'
  shortID: string
  digest: string
  tree: string

  objectURL: SafeResourceUrl
  filename: string

  constructor (
    private sanitizer: DomSanitizer,
    private http: Http,
    private renderer: Renderer,
    private ui: UiService,
    private detectRef: ChangeDetectorRef
  ) {
    http.get('https://api.github.com/repos/coast-team/mute/branches/gh-pages')
      .toPromise()
      .then((response) => {
        this.url += response.json().commit.commit.message
        this.shortID = response.json().commit.commit.message.substr(0, 7)
      })
      .catch((err) => log.warn('DevLabelComponent could not fetch commit number: ', err))
  }

  ngOnInit (): void {
    this.ui.onDocDigest.subscribe((digest: number) => {
      this.digest = mnemonic.encode_int32(digest)
      this.detectRef.markForCheck()
    })

    this.ui.onDocTree.subscribe((tree: string) => {
      this.tree = tree
    })
  }

  exportLog (): void {
    const urlParts: string[] = window.location.href.split('/')
    const docID = urlParts[urlParts.length - 1]
    this.filename = `log-${docID}-${this.digest}.json`
    let db = jIO.createJIO({ type: 'query',  sub_storage: { type: 'indexeddb', database: 'mute' } })
    db.getAttachment(docID, 'body').then((body) => {
      this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(body))
      const clickEvent = new MouseEvent('click')

      this.detectRef.detectChanges()

      setTimeout(() => {
        this.renderer.invokeElementMethod(this.link.nativeElement, 'dispatchEvent', [clickEvent])
      }, 1000)
    })
  }

  exportTree (): void {
    const urlParts: string[] = window.location.href.split('/')
    const docID = urlParts[urlParts.length - 1]
    this.filename = `tree-${docID}-${this.digest}.json`
    const blob = new Blob([this.tree], { type : 'text\/json' })
    this.objectURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))

    this.detectRef.detectChanges()

    const clickEvent = new MouseEvent('click')
    setTimeout(() => {
      this.renderer.invokeElementMethod(this.link.nativeElement, 'dispatchEvent', [clickEvent])
    }, 1000)
  }

}
