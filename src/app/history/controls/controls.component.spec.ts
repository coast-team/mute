import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { UiService } from '../../core/ui'
import { ControlsComponent } from './controls.component'

let comp: ControlsComponent
let fixture: ComponentFixture<ControlsComponent>

const uiServiceStub = undefined

describe('HistoryControlsComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ControlsComponent],
        imports: [RouterTestingModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [{ provide: UiService, useValue: uiServiceStub }],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ControlsComponent)
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
