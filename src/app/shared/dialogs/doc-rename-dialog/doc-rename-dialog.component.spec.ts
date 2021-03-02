import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DocRenameDialogComponent } from './doc-rename-dialog.component'

xdescribe('DocRenameDialogComponent', () => {
  let component: DocRenameDialogComponent
  let fixture: ComponentFixture<DocRenameDialogComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DocRenameDialogComponent],
      }).compileComponents()

      fixture = TestBed.createComponent(DocRenameDialogComponent)
      component = fixture.componentInstance
      // fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
