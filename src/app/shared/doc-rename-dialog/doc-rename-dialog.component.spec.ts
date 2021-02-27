import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DocRenameDialogComponent } from './doc-rename-dialog.component'

describe('DocRenameDialogComponent', () => {
  let component: DocRenameDialogComponent
  let fixture: ComponentFixture<DocRenameDialogComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DocRenameDialogComponent],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(DocRenameDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
