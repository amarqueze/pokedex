import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { User } from '../shared/models/User.model';
import { LocalStorageService } from '../shared/service/storage/local-storage.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  listAction = ActionLanding;
  action: ActionLanding = ActionLanding.SIGN_IN;
  trainers: pokemonTrainers = {};

  isErrorAuthentication: boolean = false;
  isErrorRegister: boolean = false;
  isSucccessRegister: boolean = false;

  @Output() authenticationSuccess: EventEmitter<User> = new EventEmitter<User>();

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.trainers = this.localStorageService.restoreItem('users') ?? {};
  }

  changeFormRegister() {
    this.action = ActionLanding.SIGN_UP;
  }

  changeFormLogin() {
    this.action = ActionLanding.SIGN_IN;
  }

  comprobateTrainer(user: any) {
    if(this.trainers[user.email] && this.trainers[user.email].password == user.password) {
      this.authenticationSuccess.emit(this.trainers[user.email]);
    } else {
      this.showErrorAuthentication();
    }
  }

  registerTrainer(user: any) {
    if(user.email == undefined) {
      return;
    }

    if(this.trainers[user.email] != undefined && this.trainers[user.email] != null) {
      this.showErrorRegister();
      return;
    }

    this.changeFormLogin(); 
    this.trainers[user.email] = user;
    this.localStorageService.saveItem('users', this.trainers);
    this.showRegisterSuccess();
  }

  showErrorAuthentication() {
    this.isErrorAuthentication = true;
    setTimeout(() => {
      this.isErrorAuthentication = false;
    }, 3000);
  }

  showErrorRegister() {
    this.isErrorRegister = true;
    setTimeout(() => {
      this.isErrorRegister = false;
    }, 3000);
  }

  showRegisterSuccess() {
    this.isSucccessRegister = true;
    setTimeout(() => {
      this.isSucccessRegister = false;
    }, 3000);
  }
}

export enum ActionLanding {
  SIGN_IN,
  SIGN_UP
}

export type pokemonTrainers = {
  [key: string]: User
}
