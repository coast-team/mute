import { Component, OnInit, Injectable, Input } from '@angular/core'

@Component({
  selector: 'mute-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
@Injectable()
export class TimelineComponent implements OnInit {

  @Input() nbVersions: number

  constructor () { }

  ngOnInit () {
  }

}
