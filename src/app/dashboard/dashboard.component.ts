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
  filteredPokemons: Pokemon[] = [];
  pokemons: Pokemon[] = [];

  nameReg: string = ''; 
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
    this.filteredPokemons = pokemons;
    this.fillDashboard(pokemons.slice(this.indexPage, this.numberOfElements));
  }

  fillDashboard(pokemons: Pokemon[]) {
    this.pokemons = pokemons;
  }

  filterPokemons(newText: string): void {
    if(newText) {
      this.filteredPokemons = this.allPokemons.filter(p => p.name.startsWith(newText));
    } else {
      this.filteredPokemons = this.allPokemons;   
    }

    this.indexPage = 0;
    this.numberOfElements = 50;
    this.enableBtnPreviuos = false;
    this.enableBtnNext = this.filteredPokemons.length < 50 ? false : true;
    this.fillDashboard(this.filteredPokemons.slice(this.indexPage, this.numberOfElements));
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
    this.numberOfElements = this.numberOfElements + 50;
    this.enableBtnNext = this.numberOfElements < this.filteredPokemons.length ? true : false;
    this.fillDashboard(this.filteredPokemons.slice(this.indexPage, this.numberOfElements));
  }

  previousPage(): void {
    if (!this.enableBtnPreviuos) return;

    this.indexPage = this.indexPage - 50;
    this.enableBtnPreviuos = this.indexPage != 0 ? true : false;    
    this.numberOfElements = this.numberOfElements - 50;
    this.enableBtnNext = this.numberOfElements < this.filteredPokemons.length ? true : false;
    this.fillDashboard(this.filteredPokemons.slice(this.indexPage, this.numberOfElements));
  }
}
