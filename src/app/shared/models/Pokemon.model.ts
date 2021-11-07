import { PokemonDetail } from "./PokemonDetail.model";

export class Pokemon {
    detail?: PokemonDetail;
    constructor(public name: string, public infoUrl: string) {}
}