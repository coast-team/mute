import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DocRenameDialogComponent } from './doc-rename-dialog.component'

describe('DocRenameDialogComponent', () => {
  let component: DocRenameDialogComponent
  let fixture: ComponentFixture<DocRenameDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocRenameDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DocRenameDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
