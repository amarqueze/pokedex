import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  listAction = ActionLanding;
  action: ActionLanding = ActionLanding.SIGN_IN;

  constructor() { }

  ngOnInit(): void {
    console.log("init Lading");
  }

}

export enum ActionLanding {
  SIGN_IN,
  SIGN_UP
}
