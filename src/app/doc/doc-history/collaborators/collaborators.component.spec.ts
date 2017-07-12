import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'
import { CollaboratorsComponent } from './collaborators.component'


let comp: CollaboratorsComponent
let fixture: ComponentFixture<CollaboratorsComponent>

describe('CollaboratorsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CollaboratorsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
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
  xit('Correct Init', () => {
    expect(comp).toBeTruthy()
  })
}
