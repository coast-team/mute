import { Component } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { AppComponent } from './app.component'
import { UiService } from './core/ui'

@Component({ selector: 'mute-toolbar', template: '' })
class ToolbarStubComponent { }

@Component({ selector: 'mute-dev-label', template: '' })
class DevLabelStubComponent { }

let comp: AppComponent
let fixture: ComponentFixture<AppComponent>

describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [UiService],
        declarations: [AppComponent, ToolbarStubComponent, DevLabelStubComponent],
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

const tests = () => {
  it('Should create the component', () => {
    expect(comp).toBeTruthy()
  })
}
