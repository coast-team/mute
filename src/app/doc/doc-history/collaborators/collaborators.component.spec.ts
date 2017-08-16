import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'
import { CollaboratorsComponent } from './collaborators.component'
import { DocHistoryService } from '../doc-history.service'


let comp: CollaboratorsComponent
let fixture: ComponentFixture<CollaboratorsComponent>

let docHistoryService

describe('CollaboratorsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CollaboratorsComponent
      ],
      imports: [
        RouterTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: DocHistoryService, useValue: docHistoryService}
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(CollaboratorsComponent)
      comp = fixture.componentInstance
    })
  }))
  tests()
})

function tests () {
  it('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
