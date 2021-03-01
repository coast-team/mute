import { TestBed, waitForAsync } from '@angular/core/testing'
import { Ng2UiAuthModule } from 'np2-ui-auth'
import { SettingsService } from '../settings/settings.service'

describe('SettingsService', () => {
  let settings: SettingsService

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ Ng2UiAuthModule.forRoot() ],
      providers: [SettingsService]
    })
    settings = TestBed.inject(SettingsService)
  }))

  it('Correct Init', () => expect(settings).toBeTruthy())

  xit('Get default displayName', async () => {
    await settings.init()
    expect(settings.profile.displayName).toEqual('Anonymous')
  })

  xit('Set pseudo', async () => {
    await settings.init()
    settings.profile.displayName = 'Testing'
    expect(settings.profile.displayName).toEqual('Testing')
  })
})
