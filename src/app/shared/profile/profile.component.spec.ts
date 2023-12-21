import { Overlay } from '@angular/cdk/overlay'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Ng2UiAuthModule } from 'np2-ui-auth'

import { SettingsService } from 'src/app/core/settings'
import { UiService } from 'src/app/core/ui'
import { ProfileComponent } from './profile.component'
import { ProfileModule } from './profile.module'

describe('ProfileComponent', () => {
  let component: ProfileComponent
  let fixture: ComponentFixture<ProfileComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ProfileModule, Ng2UiAuthModule.forRoot()],
      providers: [MatSnackBar, Overlay, SettingsService, UiService],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent)
    component = fixture.componentInstance
    // fixture.detectChanges()
  })

  it('Should create the component', () => {
    expect(component).toBeTruthy()
  })
})
