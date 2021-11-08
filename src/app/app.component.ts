import { Component, OnInit } from '@angular/core';
import { User } from './shared/models/User.model';
import { LocalStorageService } from './shared/service/storage/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'pokedex';
  userActive?: User;
  hasSession = false;

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.userActive = this.localStorageService.restoreItem("activeUser");
    this.hasSession = !!this.userActive;
  }

  changeToDashboard(userActive: User) {
    this.localStorageService.saveItem("activeUser", userActive);
    this.userActive = userActive;
    this.hasSession = true;
  }
}
