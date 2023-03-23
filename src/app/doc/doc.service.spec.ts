import { ChangeDetectorRef } from '@angular/core'
import { inject, TestBed } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { Ng2UiAuthModule } from 'np2-ui-auth'
import { SettingsService } from '@app/core/settings/settings.service'

import { DocService } from './doc.service'
import { RichCollaboratorsService } from './rich-collaborators'

xdescribe('DocService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), Ng2UiAuthModule.forRoot()],
      providers: [DocService, RichCollaboratorsService, ChangeDetectorRef, SettingsService],
    })
  })

  it('Should initialize the service', inject([DocService], (service: DocService) => {
    expect(service).toBeTruthy()
  }))
})
