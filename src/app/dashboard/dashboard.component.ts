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
  indexPage: number = 0;
  numberOfElements: number = 50;  
  allPokemons: Pokemon[] = [];
  pokemons: Pokemon[] = [];

  enableBtnPreviuos: boolean = false;
  enableBtnNext: boolean = true;

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
    this.allPokemons = pokemons;
    this.fillDashboard(pokemons.slice(this.indexPage, this.numberOfElements));
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

  nextPage(): void {
    if (!this.enableBtnNext) return;

    this.indexPage = this.indexPage + 50;
    this.enableBtnPreviuos = this.indexPage != 0 ? true : false;
    this.enableBtnNext = this.numberOfElements < this.allPokemons.length ? true : false;
    this.numberOfElements = this.numberOfElements + 50;
    this.fillDashboard(this.allPokemons.slice(this.indexPage, this.numberOfElements));
  }

  previousPage(): void {
    if (!this.enableBtnPreviuos) return;

    this.indexPage = this.indexPage - 50;
    this.enableBtnPreviuos = this.indexPage != 0 ? true : false;    
    this.numberOfElements = this.numberOfElements - 50;
    this.enableBtnNext = this.numberOfElements < this.allPokemons.length ? true : false;
    this.fillDashboard(this.allPokemons.slice(this.indexPage, this.numberOfElements));
  }
}
