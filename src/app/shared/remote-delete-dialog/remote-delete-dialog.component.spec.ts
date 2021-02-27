import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { RemoteDeleteDialogComponent } from './remote-delete-dialog.component'

describe('RemoteDeleteDialogComponent', () => {
  let component: RemoteDeleteDialogComponent
  let fixture: ComponentFixture<RemoteDeleteDialogComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RemoteDeleteDialogComponent],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteDeleteDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
