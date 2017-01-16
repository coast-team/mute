/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { DebugElement } from '@angular/core'

import { InviteBotComponent } from './invite-bot.component'

describe('InviteBotComponent', () => {
  let component: InviteBotComponent
  let fixture: ComponentFixture<InviteBotComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteBotComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteBotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
