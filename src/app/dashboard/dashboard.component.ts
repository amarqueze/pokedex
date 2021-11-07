import { Component, OnInit } from '@angular/core';

import { Location } from '@angular/common';
import { PokemonService } from '../shared/service/pokemon/pokemon.service';
import { Pokemon } from '../shared/models/Pokemon.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit { 
  isActiveSidebar: boolean = false;
  pokemons: Pokemon[] = [];

  constructor(
    private location: Location, 
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.location.replaceState('/pokedex');
    this.pokemonService.getAllPokemons()
      .subscribe(pokemons => this.initDashboard(pokemons));
  }

  initDashboard(pokemons: Pokemon[]) {
    this.fillDashboard(pokemons.slice(0, 50));
  }

  fillDashboard(pokemons: Pokemon[]) {
    this.pokemons = pokemons;
  }

  openSidebar(): void {
    this.isActiveSidebar = true;
  }

  closeSidebar(): void {
    this.isActiveSidebar = false;
  }
}
