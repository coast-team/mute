import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'

import { ToolbarComponent } from './toolbar.component'

describe('ToolbarComponent', () => {
  let component: ToolbarComponent
  let fixture: ComponentFixture<ToolbarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      imports: [MatToolbarModule, MatIconModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('Should create the documents toolbar component', () => {
    expect(component).toBeTruthy()
  })
})
