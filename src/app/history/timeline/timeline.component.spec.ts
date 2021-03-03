import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { TimelineComponent } from './timeline.component'

let comp: TimelineComponent
let fixture: ComponentFixture<TimelineComponent>

describe('TimelineComponent', () => {
  beforeEach(
    waitForAsync(() => {
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
    })
  )
  tests()
})

function tests() {
  it('Should create the component', () => {
    expect(comp).toBeTruthy()
  })
}
