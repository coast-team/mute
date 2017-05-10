import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HistoryToolsComponent } from './history-tools.component'

describe('HistoryToolsComponent', () => {
  let component: HistoryToolsComponent
  let fixture: ComponentFixture<HistoryToolsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryToolsComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryToolsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
