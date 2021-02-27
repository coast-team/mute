import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { SyncComponent } from './sync.component'

describe('SyncComponent', () => {
  let component: SyncComponent
  let fixture: ComponentFixture<SyncComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SyncComponent],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
