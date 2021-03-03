import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { HistoryService } from '../history.service'
import { CollaboratorsComponent } from './collaborators.component'

let comp: CollaboratorsComponent
let fixture: ComponentFixture<CollaboratorsComponent>

const historyService = undefined

describe('CollaboratorsComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CollaboratorsComponent],
        imports: [RouterTestingModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [{ provide: HistoryService, useValue: historyService }],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(CollaboratorsComponent)
          comp = fixture.componentInstance
        })
    })
  )
  tests()
})

function tests() {
  it('Should create the component', () => {
    expect(comp).toBeTruthy()
  })
}
