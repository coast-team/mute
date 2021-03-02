import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { RemoteDeleteDialogComponent } from './remote-delete-dialog.component'

xdescribe('RemoteDeleteDialogComponent', () => {
  let component: RemoteDeleteDialogComponent
  let fixture: ComponentFixture<RemoteDeleteDialogComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule ],
        declarations: [ RemoteDeleteDialogComponent ]
      }).compileComponents()

      fixture = TestBed.createComponent(RemoteDeleteDialogComponent)
      component = fixture.componentInstance
      // fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
