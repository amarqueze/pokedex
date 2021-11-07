import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit { 
  isActiveSidebar: boolean = false;

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.location.replaceState('/pokedex');
  }

  openSidebar(): void {
    this.isActiveSidebar = true;
  }

  closeSidebar(): void {
    this.isActiveSidebar = false;
  }
}
