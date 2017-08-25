import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'
import { HistoryControlsComponent } from './history-controls.component'
import { UiService } from '../../../core/ui/ui.service'


let comp: HistoryControlsComponent
let fixture: ComponentFixture<HistoryControlsComponent>

const uiServiceStub = undefined

describe('HistoryControlsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HistoryControlsComponent
      ],
      imports: [
        RouterTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: UiService, useValue: uiServiceStub}
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(HistoryControlsComponent)
      comp = fixture.componentInstance
    })
  }))
  tests()
})

function tests () {
  it('Correct Init', () => {
    console.log(comp)
    expect(comp).toBeTruthy()
  })
}
