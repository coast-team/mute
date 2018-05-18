import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { DocHistoryService } from '../doc-history.service'
import { CollaboratorsComponent } from './collaborators.component'

let comp: CollaboratorsComponent
let fixture: ComponentFixture<CollaboratorsComponent>

const docHistoryService = undefined

describe('CollaboratorsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollaboratorsComponent],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: DocHistoryService, useValue: docHistoryService }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CollaboratorsComponent)
        comp = fixture.componentInstance
      })
  }))
  tests()
})

function tests() {
  it('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
