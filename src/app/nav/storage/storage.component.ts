import { Component, Input, OnInit } from '@angular/core'

import { AbstractStorageService } from 'core/AbstractStorageService'

@Component({
  selector: 'mute-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {

  private available: boolean
  private tooltipMsg: string
  @Input() storageService: AbstractStorageService

  constructor () {}

  ngOnInit () {
    this.storageService.isReachable()
      .then((isReachable: boolean) => {
        this.available = isReachable
      })
      .catch(() => {
        this.available = false
      })
      .then(() => {
        if (this.available) {
          this.tooltipMsg = `Is available on: ${this.storageService}`
        } else {
          this.tooltipMsg = `${this.storageService} is not available`
        }
      })
  }

  isAvailable (): boolean {
    return this.available
  }
}
