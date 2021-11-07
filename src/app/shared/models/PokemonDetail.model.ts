export class PokemonDetail {
    constructor(
        public photo: string, 
        public id: string,
        public name: string,
        public types: string[],
        public height: string,
        public weight: string,
        public abilities: string[]
    ) {}
}