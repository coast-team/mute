import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ResolverDialogComponent } from './resolver-dialog.component'

describe('ResolverDialogComponent', () => {
  let component: ResolverDialogComponent
  let fixture: ComponentFixture<ResolverDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResolverDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolverDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
