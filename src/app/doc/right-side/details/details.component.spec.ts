import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatCardModule } from '@angular/material/card'

import { UiService } from 'src/app/core/ui'
import { PulsarService } from '../../network'
import { DetailsComponent } from './details.component'

describe('DetailsComponent', () => {
  let component: DetailsComponent
  let fixture: ComponentFixture<DetailsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsComponent],
      imports: [MatCardModule],
      providers: [UiService, PulsarService],
    }).compileComponents()

    fixture = TestBed.createComponent(DetailsComponent)
    component = fixture.componentInstance
  }))

  it('Should create the component', () => {
    expect(component).toBeTruthy()
  })
})
