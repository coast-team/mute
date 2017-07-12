import { UiService } from './ui.service'
import { async } from '@angular/core/testing'

describe('UiService', () => {
  let uiService: UiService

  beforeEach(async(() => uiService = new UiService()))

  it('Correct Init', () => expect(uiService).toBeTruthy())

})
