import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pokemon } from '../../models/Pokemon.model';
import { PokemonService } from '../../service/pokemon/pokemon.service';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent implements OnInit {  
  Styles: PokemonCardStyles = {
    normal: 'style-normal',
    fighting: 'style-fighting',
    flying: 'style-flying',
    poison: 'style-poison',
    ground: 'style-ground',
    rock: 'style-rock',
    bug: 'style-bug',
    ghost: 'style-ghost',
    steel: 'style-steel',
    fire: 'style-fire',
    water: 'style-water',
    grass: 'style-grass',
    electric: 'style-electric',
    psychic: 'style-psychic',
    ice: 'style-ice',
    dragon: 'style-dragon',
    dark: 'style-dark',
    fairy: 'style-fairy',
    unknown: 'style-unknown',
    shadow: 'style-shadow'
  };
  styleCard: string = this.Styles['normal'];
  @Input() pokemon!: Pokemon;
  @Output() pokemonChange: EventEmitter<Pokemon> = new EventEmitter<Pokemon>();

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.pokemonService.getDetailPokemon(this.pokemon.infoUrl)
      .subscribe(p => {
        this.pokemon.detail = p;
        this.styleCard = this.Styles[this.pokemon.detail.types[0]];
        this.pokemonChange.emit(this.pokemon);
        console.log(this.pokemon);
      })
  }
}

export type PokemonCardStyles = {
  [key: string]: string
}