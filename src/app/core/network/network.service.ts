import { Injectable } from '@angular/core'
import  * as netflux  from 'netflux'


@Injectable()
export class NetworkService {

  constructor() {
    let webChannel = netflux.create()
    console.log('WebChannel: ', webChannel)
  }

}
