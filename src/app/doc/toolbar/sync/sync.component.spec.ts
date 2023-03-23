import { HttpClientModule } from '@angular/common/http'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { Ng2UiAuthModule } from 'np2-ui-auth'
import { CryptoService } from 'src/app/core/crypto/crypto.service'
import { SettingsService } from 'src/app/core/settings/settings.service'
import { NetworkServiceAbstracted } from '@app/doc/network/network.service.abstracted'
import { PulsarService } from '@app/doc/network/solutions/pulsar.service'

import { SyncComponent } from './sync.component'

xdescribe('SyncComponent', () => {
  let component: SyncComponent
  let fixture: ComponentFixture<SyncComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SyncComponent],
        imports: [RouterModule.forRoot([]), HttpClientModule, Ng2UiAuthModule.forRoot()],
        providers: [NetworkServiceAbstracted, CryptoService, SettingsService, PulsarService]
      }).compileComponents()

      fixture = TestBed.createComponent(SyncComponent)
      component = fixture.componentInstance
      // fixture.detectChanges()
    })
  )

  it('Should create the component', () => {
    expect(component).toBeTruthy()
  })
})
