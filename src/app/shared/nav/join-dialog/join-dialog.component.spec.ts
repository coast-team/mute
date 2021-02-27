import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { JoinDialogComponent } from './join-dialog.component'

describe('JoinDialogComponent', () => {
  let component: JoinDialogComponent
  let fixture: ComponentFixture<JoinDialogComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [JoinDialogComponent],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
