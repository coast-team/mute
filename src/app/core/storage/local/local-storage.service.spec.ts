import { HttpClientModule } from '@angular/common/http'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { Ng2UiAuthModule } from 'np2-ui-auth'
import { Doc } from '../../Doc'
import { SettingsService } from '../../settings/settings.service'
import { BotStorageService } from '../bot/bot-storage.service'
import { LocalStorageService } from './local-storage.service'

xdescribe('LocalStorageService', () => {
  let settings: SettingsService
  let localStorage: LocalStorageService
  let doc: Doc

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, Ng2UiAuthModule.forRoot()],
      providers: [LocalStorageService, BotStorageService, SettingsService]
    })
    settings = TestBed.inject(SettingsService)
    localStorage = TestBed.inject(LocalStorageService)
    localStorage.init(settings)
  }))

  it('Correct Init', () => {
    expect(localStorage).toBeTruthy()
  })

  it('Get doc', async () => {
    doc = await localStorage.createDoc()
    localStorage.fetchDoc(doc.id).then((fetchDoc) => {
      expect(fetchDoc === doc).toBeTruthy()
    })
  })

  it('Delete doc', async () => {
    doc = await localStorage.createDoc()
    doc.delete().then(() => {
      localStorage.delete(doc).catch((del) => {
        expect(del === new Error('Cannot find document ' + doc.id)).toBeTruthy()
      })
    })
  })
})
