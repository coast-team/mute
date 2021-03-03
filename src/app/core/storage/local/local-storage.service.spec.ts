import { HttpClientModule } from '@angular/common/http'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { SettingsService } from '@app/core/settings'
import { Ng2UiAuthModule } from 'np2-ui-auth'
import { Subject } from 'rxjs'
import { Doc } from '../../Doc'
import { BotStorageService } from '../bot/bot-storage.service'
import { LocalStorageService } from './local-storage.service'

describe('LocalStorageService', () => {
  let localStorage: LocalStorageService
  let doc: Doc

  const fakeBotStorange = {
    id: 'fake',
    status: BotStorageService.AVAILABLE
  }
  const fakeSettings = {
    profile: {
      login: 'fake'
    },
    onChange: (new Subject<any>()).asObservable()
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, Ng2UiAuthModule.forRoot()],
      providers: [
        LocalStorageService,
        { provide: BotStorageService, useValue: fakeBotStorange },
        { provide: SettingsService, useValue: fakeSettings }
      ]
    })
    localStorage = TestBed.inject(LocalStorageService)
    localStorage.init(TestBed.inject(SettingsService))
  }))

  it('Should initialize the service', () => {
    expect(localStorage).toBeTruthy()
  })

  xit('Get doc', async () => {
    doc = await localStorage.createDoc()
    localStorage.fetchDoc(doc.id).then((fetchDoc) => {
      expect(fetchDoc === doc).toBeTruthy()
    })
  })

  xit('Delete doc', async () => {
    doc = await localStorage.createDoc()
    doc.delete().then(() => {
      localStorage.delete(doc).catch((del) => {
        expect(del === new Error('Cannot find document ' + doc.id)).toBeTruthy()
      })
    })
  })
})
