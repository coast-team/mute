import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HistoryEditorComponent } from './history-editor.component'

describe('HistoryEditorComponent', () => {
  let component: HistoryEditorComponent
  let fixture: ComponentFixture<HistoryEditorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryEditorComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryEditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
