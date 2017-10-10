import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MdSnackBar } from '@angular/material'
import { RouterTestingModule } from '@angular/router/testing'
import { ProfileService } from '../core/profile/profile.service'
import { UiService } from '../core/ui/ui.service'
import { NetworkService } from '../doc/network/network.service'
import { ToolbarComponent } from './toolbar.component'

let comp: ToolbarComponent
let fixture: ComponentFixture<ToolbarComponent>

const uiServiceStub = undefined
const networkServiceStub = undefined
const profileServiceStub = undefined
const mdSnackBarStub = undefined

describe('ToolbarComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ToolbarComponent
      ],
      imports: [
        RouterTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: UiService, useValue: uiServiceStub },
        { provide: NetworkService, useValue: networkServiceStub },
        { provide: ProfileService, useValue: profileServiceStub },
        { provide: MdSnackBar, useValue: mdSnackBarStub }
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ToolbarComponent)
      comp = fixture.componentInstance
    })
  }))
  tests()
})

function tests () {
  it('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
