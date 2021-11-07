import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'pokedex';
  hasSession = true;

  changeToLanding(): void {
    this.hasSession = false;
  }
}
