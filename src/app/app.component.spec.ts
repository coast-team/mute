import { Component } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { AppComponent } from './app.component'

import { RouterOutletStubComponent } from '../testing/router-stubs'

@Component({ selector: 'mute-toolbar', template: '' })
class ToolbarStubComponent {}

@Component({ selector: 'mute-dev-label', template: '' })
class DevLabelStubComponent {}

let comp: AppComponent
let fixture: ComponentFixture<AppComponent>

describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [AppComponent, ToolbarStubComponent, DevLabelStubComponent, RouterOutletStubComponent],
      })

        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppComponent)
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
