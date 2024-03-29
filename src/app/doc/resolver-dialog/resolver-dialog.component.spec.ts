import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreModule } from 'src/app/core/core.module'

import { ResolverDialogComponent } from './resolver-dialog.component'

describe('ResolverDialogComponent', () => {
  let component: ResolverDialogComponent
  let fixture: ComponentFixture<ResolverDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, MatDialogModule],
      declarations: [ResolverDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ResolverDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('Should create the component', () => {
    expect(component).toBeTruthy()
  })
})
