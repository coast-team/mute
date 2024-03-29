import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatFormFieldModule } from '@angular/material/form-field'
import { RouterModule } from '@angular/router'

import { JoinDialogComponent } from './join-dialog.component'

describe('JoinDialogComponent', () => {
  let component: JoinDialogComponent
  let fixture: ComponentFixture<JoinDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), MatFormFieldModule],
      declarations: [JoinDialogComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(JoinDialogComponent)
    component = fixture.componentInstance
    // fixture.detectChanges()
  }))

  it('Should create the component', () => {
    expect(component).toBeTruthy()
  })
})
