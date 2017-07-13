import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'
import { TimelineComponent } from './timeline.component'

let comp: TimelineComponent
let fixture: ComponentFixture<TimelineComponent>

let uiServiceStub

describe('TimelineComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TimelineComponent
      ],
      imports: [
        RouterTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(TimelineComponent)
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
