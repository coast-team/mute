/* tslint:disable:component-selector */
import { Component, Directive, Injectable, Input } from '@angular/core'
import { NavigationExtras } from '@angular/router'

@Component({selector: 'router-outlet', template: ''})
export class RouterOutletStubComponent { }

@Injectable()
export class RouterStub {
  navigate (commands: any[], extras?: NavigationExtras) {}
}
