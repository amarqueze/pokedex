import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RegisterFormComponent } from './landing/register-form/register-form.component';
import { LoginFormComponent } from './landing/login-form/login-form.component';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InputSearchComponent } from './shared/components/input-search/input-search.component';
import { PokemonCardComponent } from './shared/components/pokemon-card/pokemon-card.component';
import { PokemonDetailComponent } from './shared/components/pokemon-detail/pokemon-detail.component';
import { ProfileComponent } from './shared/components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterFormComponent,
    LoginFormComponent,
    LandingComponent,
    DashboardComponent,
    InputSearchComponent,
    PokemonCardComponent,
    PokemonDetailComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule
  ],
  exports: [
    InputSearchComponent,
    PokemonCardComponent,
    PokemonDetailComponent,
    ProfileComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
