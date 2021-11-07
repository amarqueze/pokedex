import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Pokemon } from '../../models/Pokemon.model';
import { PokemonDetail } from '../../models/PokemonDetail.model';


@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private httpClient: HttpClient) { }

  getAllPokemons(): Observable<Pokemon[]> {
    return this.httpClient.get<any>('https://pokeapi.co/api/v2/pokemon?limit=1118')
      .pipe(map(val => val.results ))
      .pipe(map(
        results => results.map((p: any) => new Pokemon(p.name, p.url)) 
      ));
  }

  getDetailPokemon(infoUrl: string): Observable<PokemonDetail> {
    return this.httpClient.get<any>(infoUrl)
      .pipe(map(
        (val: any) => new PokemonDetail(
          val.sprites.front_default,
          val.id,
          val.name,
          val.types.map((item: any) => item.type.name),
          val.height,
          val.weight,
          val.abilities.map((item: any) => item.ability.name)
        )
      ))
  }
}
