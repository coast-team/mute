import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx'
import { AbstractStorageService } from '../AbstractStorageService'
import { LocalStorageService } from '../local-storage/local-storage.service'
import { BotStorageService } from '../bot-storage/bot-storage.service'

@Injectable()
export class StorageManagerService {

  private storageServices: AbstractStorageService[]
  private currentStorageService: AbstractStorageService
  private storageServiceSubject: Subject<AbstractStorageService>
  private docsSubject: BehaviorSubject<any>

  constructor (localStorage: LocalStorageService, botStorage: BotStorageService) {
    this.storageServices = [localStorage, botStorage]
    this.docsSubject = new BehaviorSubject<any>([])
    this.storageServiceSubject = new Subject<AbstractStorageService>()
  }

  get onDocs (): Observable<any> {
    return this.docsSubject
  }

  get onStorageService (): Observable<AbstractStorageService> {
    return this.storageServiceSubject.asObservable()
  }

  getStorageByLink (link) {
    for (let s of this.storageServices) {
      if (s.link === link) {
        return s
      }
    }
  }

  getStorageServices (): AbstractStorageService[] {
    return this.storageServices
  }

  getCurrentStorageService (): AbstractStorageService {
    return this.currentStorageService
  }

  setCurrentStorageService (storageService: AbstractStorageService): void {
    this.currentStorageService = storageService
    this.storageServiceSubject.next(storageService)
    this.getDocuments().then((docs: any[]) => {
      this.docsSubject.next(docs)
    })
  }

  getDocuments (): Promise<any> {
    return this.currentStorageService.getDocuments()
  }

}
