import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { TimelineComponent } from './timeline.component'

let comp: TimelineComponent
let fixture: ComponentFixture<TimelineComponent>

describe('TimelineComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineComponent],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TimelineComponent)
        comp = fixture.componentInstance
      })
  }))
  tests()
})

function tests() {
  it('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
