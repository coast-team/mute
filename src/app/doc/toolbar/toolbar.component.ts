import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'

import { Doc } from '../../core/Doc'
import { BotStorageService } from '../../core/storage/bot/bot-storage.service'
import { LocalStorageService } from '../../core/storage/local/local-storage.service'
import { NetworkService } from '../network'

@Component({
  selector: 'mute-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() doc: Doc
  @Output() menu: EventEmitter<void>
  @Output() info: EventEmitter<void>
  @ViewChild('input') input: ElementRef

  public botNotAvailable: boolean

  constructor(
    private cd: ChangeDetectorRef,
    private network: NetworkService,
    private botStorage: BotStorageService,
    private localStorage: LocalStorageService
  ) {
    this.menu = new EventEmitter()
    this.info = new EventEmitter()
    this.botNotAvailable = true
    botStorage.onStatus.subscribe((code) => (this.botNotAvailable = code !== BotStorageService.AVAILABLE))
  }

  ngOnInit() {
    this.doc.onDocChange.subscribe((newTitle) => {
      this.cd.detectChanges()
      this.localStorage.save(this.doc)
    })
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
      this.localStorage.save(this.doc)
    }
  }

  selectTitle() {
    this.input.nativeElement.select()
  }

  inviteBot() {
    this.network.inviteBot(this.botStorage.wsURL)
  }
}
