import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { UiService } from 'src/app/core/ui/ui.service'
import { PulsarService } from '../../network/pulsar.service'

import { DetailsComponent } from './details.component'

describe('DetailsComponent', () => {
  let component: DetailsComponent
  let fixture: ComponentFixture<DetailsComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DetailsComponent],
        providers: [UiService, PulsarService]
      }).compileComponents()
    
      fixture = TestBed.createComponent(DetailsComponent)
      component = fixture.componentInstance
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
