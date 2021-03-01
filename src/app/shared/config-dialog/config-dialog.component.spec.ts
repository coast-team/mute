import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ConfigDialogComponent } from './config-dialog.component'

xdescribe('ConfigDialogComponent', () => {
  let component: ConfigDialogComponent
  let fixture: ComponentFixture<ConfigDialogComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ConfigDialogComponent],
      }).compileComponents()

      fixture = TestBed.createComponent(ConfigDialogComponent)
      component = fixture.componentInstance
      // fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
