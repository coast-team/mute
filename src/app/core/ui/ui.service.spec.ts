import { waitForAsync } from '@angular/core/testing'
import { UiService } from './ui.service'

describe('UiService', () => {
  let uiService: UiService

  beforeEach(waitForAsync(() => (uiService = new UiService())))

  it('Should initialize the service', () => expect(uiService).toBeTruthy())
})
