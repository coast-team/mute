import { MockComponent } from '../../testing/mock-component'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { ToolbarComponent } from './toolbar.component'


let comp: ToolbarComponent
let fixture: ComponentFixture<ToolbarComponent>

describe('ToolbarComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
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
  xit('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
