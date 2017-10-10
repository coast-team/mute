/* tslint:disable:component-selector */
import { Component, Injectable } from '@angular/core'

@Component({selector: 'router-outlet', template: ''})
export class RouterOutletStubComponent { }

@Injectable()
export class RouterStub {
  navigate () {}
}
