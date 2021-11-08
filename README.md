# Pokedex

Use the advanced search to find Pokemon by its name and type. 

## Execute with Local

* Node 14 LTS
* Angular 12

` ng serve --port #port `

## Execute with Docker

* Docker

let’s build an image called pokedex

` docker build -t pokedex . `

Now that our image is built, we can start a container with the following command, which will serve our app on port 8080.

` docker run --rm -it -p 8080:80 pokedex `

Open your browser on:

`localhost:8080/`