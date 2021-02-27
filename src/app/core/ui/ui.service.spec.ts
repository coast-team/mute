import { waitForAsync } from '@angular/core/testing'
import { UiService } from './ui.service'

describe('UiService', () => {
  let uiService: UiService

  beforeEach(waitForAsync(() => (uiService = new UiService())))

  it('Correct Init', () => expect(uiService).toBeTruthy())
})
