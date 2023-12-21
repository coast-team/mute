import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { RouterTestingModule } from '@angular/router/testing'
import { Ng2UiAuthModule } from 'np2-ui-auth'

import { SettingsService } from '@app/core/settings'
import { UiService } from '@app/core/ui'
import { NetworkServiceAbstracted } from '@app/doc/network/network.service.abstracted'
import { DocService } from '@app/doc/doc.service'
import { RichCollaboratorsService } from '@app/doc/rich-collaborators/rich-collaborators.service'
import { ToolbarComponent } from './toolbar.component'
import { MatToolbarModule } from '@angular/material/toolbar'

let comp: ToolbarComponent
let fixture: ComponentFixture<ToolbarComponent>

const uiServiceStub = undefined
const networkServiceAbstractedStub = undefined
const settingsServiceStub = undefined
const mdSnackBarStub = undefined

xdescribe('ToolbarComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      imports: [Ng2UiAuthModule.forRoot(), RouterTestingModule, MatToolbarModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DocService,
        RichCollaboratorsService,
        ChangeDetectorRef,
        { provide: UiService, useValue: uiServiceStub },
        { provide: NetworkServiceAbstracted, useValue: networkServiceAbstractedStub },
        { provide: SettingsService, useValue: settingsServiceStub },
        { provide: MatSnackBar, useValue: mdSnackBarStub },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ToolbarComponent)
        comp = fixture.componentInstance
      })
  }))
  tests()
})

function tests() {
  it('Should create the document toolbar component', () => {
    expect(comp).toBeTruthy()
  })
}
