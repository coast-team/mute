import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'mute-leftside',
  templateUrl: './leftside.component.html',
  styleUrls: ['./leftside.component.css']
})
export class LeftsideComponent implements OnInit {
  @ViewChild('start') start
  @ViewChild('pseudonym') pseudonym

  constructor() { }

  ngOnInit() {
  }

  onClick() {
    this.start.toggle()
      .then(() => console.log('clicked'))
      .catch(() => console.log('error'))
    this.pseudonym.focus()
  }
}
