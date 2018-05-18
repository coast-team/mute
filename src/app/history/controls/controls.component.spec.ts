import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { UiService } from '../../../core/ui/ui.service'
import { HistoryControlsComponent } from './history-controls.component'

let comp: HistoryControlsComponent
let fixture: ComponentFixture<HistoryControlsComponent>

const uiServiceStub = undefined

describe('HistoryControlsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryControlsComponent],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: UiService, useValue: uiServiceStub }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HistoryControlsComponent)
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
