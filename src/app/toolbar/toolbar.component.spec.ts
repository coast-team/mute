import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'
import { ToolbarComponent } from './toolbar.component'
import { UiService } from '../core/ui/ui.service'
import { NetworkService } from '../doc/network/network.service'
import { ProfileService } from '../core/profile/profile.service'
import { MdSnackBar } from '@angular/material'


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
