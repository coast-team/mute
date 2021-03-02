import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { RouterTestingModule } from '@angular/router/testing'
import { Ng2UiAuthModule } from 'np2-ui-auth'

import { SettingsService } from '../../core/settings'
import { UiService } from '../../core/ui'
import { NetworkService } from '../../doc/network'
import { DocService } from '../doc.service'
import { RichCollaboratorsService } from '../rich-collaborators'
import { ToolbarComponent } from './toolbar.component'

let comp: ToolbarComponent
let fixture: ComponentFixture<ToolbarComponent>

const uiServiceStub = undefined
const networkServiceStub = undefined
const settingsServiceStub = undefined
const mdSnackBarStub = undefined

xdescribe('ToolbarComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ToolbarComponent],
        imports: [Ng2UiAuthModule.forRoot(), RouterTestingModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          DocService,
          RichCollaboratorsService,
          ChangeDetectorRef,
          { provide: UiService, useValue: uiServiceStub },
          { provide: NetworkService, useValue: networkServiceStub },
          { provide: SettingsService, useValue: settingsServiceStub },
          { provide: MatSnackBar, useValue: mdSnackBarStub },
        ],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ToolbarComponent)
          comp = fixture.componentInstance
        })
    })
  )
  tests()
})

function tests() {
  it('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
