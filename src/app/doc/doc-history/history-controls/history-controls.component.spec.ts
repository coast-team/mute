import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HistoryControlsComponent } from './history-controls.component'

describe('HistoryControlsComponent', () => {
  let component: HistoryControlsComponent
  let fixture: ComponentFixture<HistoryControlsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryControlsComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryControlsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
