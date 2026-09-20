# Documentación técnica — Pokedex

## 1. Descripción general

**Pokedex** es una aplicación web SPA (Single Page Application) construida en **Angular 13** que permite:

- Registrar e iniciar sesión como "entrenador Pokémon" (autenticación simulada, 100% client-side).
- Explorar un listado paginado de todos los Pokémon consumiendo la [PokéAPI](https://pokeapi.co/) pública (`https://pokeapi.co/api/v2/pokemon`).
- Buscar Pokémon por nombre en tiempo real.
- Visualizar cada Pokémon en una tarjeta con su foto, tipo(s) y un color de fondo según su tipo principal.
- Cerrar sesión.

No existe backend propio: toda la "persistencia" (usuarios registrados y sesión activa) se guarda en el `localStorage` del navegador, y los datos de los Pokémon se obtienen directamente desde la PokéAPI pública.

## 2. Stack tecnológico

| Categoría         | Tecnología / Versión |
|--------------------|----------------------|
| Framework          | Angular ~13.0.x (CLI ~13.0.1) |
| Lenguaje           | TypeScript ~4.4.3 |
| Manejo de estado reactivo | RxJS ~7.4.0 |
| Formularios        | `@angular/forms` (Reactive Forms) |
| HTTP               | `@angular/common/http` (`HttpClientModule`) |
| Persistencia local | `ngx-webstorage-service` (wrapper de `localStorage`) |
| Estilos            | SCSS |
| Testing            | Jasmine + Karma (Chrome Launcher, HTML Reporter, Coverage) |
| Contenedor         | Docker (build multi-stage con `node:14` + `nginx:alpine`) |
| Runtime sugerido (README) | Node 14 LTS |

> **Nota:** el `README.md` menciona "Angular 12", pero `package.json`/`angular.json` fijan la versión en `~13.0.x`. Es una inconsistencia de documentación heredada del proyecto original.

## 3. Estructura del proyecto

```
pokedex/
├── Dockerfile                     # Build multi-stage (Node → Nginx)
├── angular.json                   # Configuración del workspace Angular CLI
├── karma.conf.js                  # Configuración del test runner
├── package.json / package-lock.json
├── tsconfig*.json                 # Configuración de TypeScript (app / spec / base)
├── .browserslistrc                # Navegadores objetivo para el build
└── src/
    ├── index.html                 # HTML raíz (monta <app-root>)
    ├── main.ts                    # Bootstrap de la aplicación Angular
    ├── polyfills.ts / test.ts     # Polyfills y entry point de tests
    ├── styles.scss                # Estilos globales
    ├── favicon.ico
    ├── assets/                    # Imágenes (logo, pokeball, lupa de búsqueda…)
    ├── environments/
    │   ├── environment.ts         # production: false
    │   └── environment.prod.ts    # production: true
    └── app/
        ├── app.module.ts          # Único NgModule de la app (no hay lazy loading)
        ├── app.component.ts/html  # Componente raíz — controla sesión (login vs dashboard)
        ├── landing/                        # Pantalla pública (no autenticado)
        │   ├── landing.component.ts/html   # Orquesta Sign In / Sign Up
        │   ├── login-form/                 # Formulario de login
        │   └── register-form/              # Formulario de registro
        ├── dashboard/                      # Pantalla privada (autenticado)
        │   └── dashboard.component.ts/html # Listado, búsqueda, paginación, sidebar
        └── shared/
            ├── components/
            │   ├── input-search/           # Input de búsqueda reutilizable
            │   ├── pokemon-card/           # Tarjeta de Pokémon (fetch de detalle + estilo por tipo)
            │   ├── pokemon-detail/         # Componente placeholder, NO usado en la app
            │   └── profile/                # Botón de perfil / cerrar sesión (usado en el header)
            ├── models/
            │   ├── Pokemon.model.ts
            │   ├── PokemonDetail.model.ts
            │   └── User.model.ts
            └── service/
                ├── pokemon/pokemon.service.ts        # Cliente HTTP hacia la PokéAPI
                └── storage/local-storage.service.ts  # Wrapper sobre localStorage
```

No se utiliza `@angular/router` ni un `AppRoutingModule`: la navegación entre "Landing" y "Dashboard" se resuelve con un `*ngSwitch` dentro de `AppComponent` según si hay una sesión activa. El servicio `Location` (`@angular/common`) se usa únicamente para reescribir la URL visible en el navegador (`/` ↔ `/pokedex`), sin enrutamiento real ni guards.

## 4. Arquitectura y flujo de la aplicación

### 4.1 Módulo raíz (`app.module.ts`)

Es el **único** `NgModule` del proyecto (no hay módulos feature ni lazy loading). Declara todos los componentes de la app y registra:

- `BrowserModule`
- `HttpClientModule` (necesario para `PokemonService`)
- `ReactiveFormsModule` (necesario para los formularios de login/registro)
- Providers: `PokemonService`, `LocalStorageService` (aunque ambos ya están marcados como `providedIn: 'root'`, por lo que este registro es redundante).

### 4.2 Componente raíz (`AppComponent`)

Actúa como **controlador de sesión** de toda la app:

```ts
ngOnInit(): void {
  this.userActive = this.localStorageService.restoreItem("activeUser");
  this.hasSession = !!this.userActive;
}
```

- Al iniciar, intenta recuperar la clave `"activeUser"` de `localStorage`.
- Si existe, `hasSession = true` y se renderiza `<app-dashboard>`.
- Si no existe, se renderiza `<app-landing>`.
- Cuando `LandingComponent` emite el evento `authenticationSuccess` (login o registro exitoso), `AppComponent.changeToDashboard()` guarda el usuario en `localStorage` bajo la clave `"activeUser"` y cambia el estado a `hasSession = true`.

Este patrón reemplaza a un router: es un simple *switch* de vista basado en estado en memoria + `localStorage`.

### 4.3 Flujo de autenticación (`LandingComponent` + `login-form` + `register-form`)

**Importante: no existe backend de autenticación.** Todo el flujo es simulado en el navegador:

1. `LandingComponent.ngOnInit()` recupera el diccionario de usuarios registrados desde `localStorage` (clave `"users"`), con la forma `{ [email]: User }`.
2. **Registro** (`RegisterFormComponent` → evento `submit` → `LandingComponent.registerTrainer()`):
   - Valida que el email no esté ya registrado.
   - Si es válido, guarda el nuevo `User` en el diccionario `trainers` y lo persiste en `localStorage["users"]`.
   - Muestra un mensaje de éxito y regresa al formulario de login.
3. **Login** (`LoginFormComponent` → evento `submit` → `LandingComponent.comprobateTrainer()`):
   - Busca el usuario por email en el diccionario `trainers` y compara la contraseña **en texto plano**.
   - Si coincide, emite `authenticationSuccess` con el `User` completo hacia `AppComponent`.
   - Si no coincide, muestra un mensaje de error temporal (3 segundos, vía `setTimeout`).
4. **Cierre de sesión** (`DashboardComponent.closeSession()` / `ProfileComponent`):
   - Elimina la clave `"activeUser"` de `localStorage`.
   - Redirige la URL a `/` y **fuerza un `window.location.reload()`** (recarga completa de la app).

#### Validaciones de formularios

- **Login (`login-form.component.ts`)**: `email` (`required`, `email`), `password` (`required`).
- **Registro (`register-form.component.ts`)**:
  - `fullName`: `required`, `minLength(5)`, `maxLength(100)`.
  - `email`: `required`, `email`.
  - `password`: `required`, `minLength(8)` + 3 validadores personalizados:
    - `least2UpperCasePassword` — exige al menos 2 mayúsculas (regex `/^(.*?[A-Z]){2,}/`).
    - `leastSpecialPassword` — exige al menos un carácter especial.
    - `leastNumberPassword` — exige al menos un número.
  - `rePassword`: `required`, más una comparación manual (`validateSame()`, disparada en `keyup`) que verifica que coincida con `password`.
  - El botón de envío se deshabilita si el formulario es inválido o las contraseñas no coinciden (`!registerForm.valid || !isSamePassword`).

### 4.4 Modelo de datos (`shared/models`)

```ts
// User.model.ts
class User {
  constructor(
    public fullName: string,
    public email: string,
    public password: string   // se persiste en texto plano en localStorage
  ) {}
}

// Pokemon.model.ts
class Pokemon {
  detail?: PokemonDetail;      // se completa de forma asíncrona (lazy) al renderizar la tarjeta
  constructor(public name: string, public infoUrl: string) {}
}

// PokemonDetail.model.ts
class PokemonDetail {
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
```

### 4.5 Servicios (`shared/service`)

#### `PokemonService` (`providedIn: 'root'`)

Cliente HTTP hacia la PokéAPI pública:

- `getAllPokemons(): Observable<Pokemon[]>`
  - `GET https://pokeapi.co/api/v2/pokemon?limit=1118` (trae **todos** los Pokémon conocidos en una sola llamada).
  - Mapea `results[]` a instancias de `Pokemon` (solo `name` + `infoUrl`, sin detalle todavía).
- `getDetailPokemon(infoUrl: string): Observable<PokemonDetail>`
  - `GET` a la URL de detalle específica de cada Pokémon.
  - Mapea la respuesta cruda de la API a una instancia de `PokemonDetail` (foto, id, nombre, tipos, altura, peso, habilidades).

> La URL base de la API está **hardcodeada** en el servicio; no se usa `environment.ts` para configurarla, a pesar de que el proyecto ya tiene archivos de entorno.

#### `LocalStorageService` (`providedIn: 'root'`)

Wrapper delgado sobre `ngx-webstorage-service` (`LOCAL_STORAGE` token):

- `saveItem(key, value)` → `storage.set(key, value)`
- `removeItem(key)` → `storage.remove(key)`
- `restoreItem(key)` → `storage.get(key)`

Claves usadas en la app:
- `"users"` → diccionario `{ [email]: User }` con todos los entrenadores registrados.
- `"activeUser"` → el `User` de la sesión actualmente activa.

### 4.6 Dashboard (`DashboardComponent`)

Pantalla principal una vez autenticado. Responsabilidades:

1. **Carga inicial** (`ngOnInit`):
   - Reescribe la URL visible a `/pokedex` (`location.replaceState`).
   - Llama a `PokemonService.getAllPokemons()` y guarda el resultado completo en `allPokemons` / `filteredPokemons`.
   - Muestra únicamente los primeros 50 elementos (`pokemons`) mediante `fillDashboard()`.

2. **Búsqueda** (`filterPokemons(newText)`):
   - Filtra `allPokemons` por coincidencia de **prefijo** (`name.startsWith(newText.toLowerCase())`), no por substring.
   - Si el texto está vacío, restaura la lista completa.
   - Reinicia la paginación a la primera página (`indexPage = 0`, `numberOfElements = 50`).

3. **Paginación** (`nextPage()` / `previousPage()`):
   - Client-side, en bloques fijos de 50 elementos, usando `Array.slice(indexPage, numberOfElements)` sobre `filteredPokemons` (ya cargado completo en memoria).
   - Los botones ❮ / ❯ se habilitan/deshabilitan según los límites de la lista filtrada.

4. **Sidebar móvil** (`isActiveSidebar`): un panel lateral alternativo al header, con el nombre del usuario y la opción de cerrar sesión (pensado para pantallas pequeñas, vía el botón `☰`).

5. **Cierre de sesión** (`closeSession()`): descrito en la sección 4.3.

### 4.7 Componentes compartidos (`shared/components`)

| Componente | Rol | Inputs / Outputs |
|---|---|---|
| `InputSearchComponent` | Input de texto controlado, emite el valor en cada `keyup` | `@Input() text`, `@Output() textChange` |
| `PokemonCardComponent` | Tarjeta visual de un Pokémon. En `ngOnInit`, llama a `PokemonService.getDetailPokemon()` para completar `pokemon.detail` (foto, tipos) **de forma individual por tarjeta** — ver nota de rendimiento más abajo. Aplica una clase CSS distinta según el tipo principal del Pokémon (mapa `Styles`, 19 tipos + `unknown`) | `@Input() pokemon`, `@Output() pokemonChange` |
| `ProfileComponent` | Botón/dropdown con el nombre del usuario y la opción "Sign Out" en el header del dashboard | `@Input() fullName`, `@Output() closeSession` |
| `PokemonDetailComponent` | **Scaffold sin implementar** (`<p>pokemon-detail works!</p>`), generado por Angular CLI pero nunca referenciado desde ninguna plantilla ni ruta. Código muerto que puede eliminarse o completarse a futuro. | — |

## 5. Estilos

- Estilos globales en `src/styles.scss`.
- Cada componente con SCSS propio (`*.component.scss`) usando `inlineStyleLanguage: scss` (configurado en `angular.json`).
- El estilo de cada `pokemon-card` cambia dinámicamente según el tipo del Pokémon (`style-fire`, `style-water`, `style-grass`, etc.), definido en el objeto `Styles` de `PokemonCardComponent`.

## 6. Configuración de entornos

| Archivo | `production` | Uso |
|---|---|---|
| `src/environments/environment.ts` | `false` | Usado en `ng serve` / build de desarrollo |
| `src/environments/environment.prod.ts` | `true` | Sustituye al anterior en build de producción (`fileReplacements` en `angular.json`) |

Actualmente el único flag es `production`, usado en `main.ts` para decidir si llamar a `enableProdMode()`. No hay variables de entorno para la URL de la API (está hardcodeada en `PokemonService`) ni para claves/secretos.

## 7. Testing

- Framework: **Jasmine** + **Karma** (`karma.conf.js`), ejecutado sobre Chrome (`karma-chrome-launcher`).
- Comando: `npm test` → `ng test`.
- Cobertura: configurada con `karma-coverage`, reportes HTML en `coverage/pokedex`.
- Existe un archivo `*.spec.ts` por cada componente/servicio (generados por Angular CLI). La mayoría corresponden al *scaffold* por defecto de Angular (verifican que el componente se cree correctamente); no se identificaron pruebas de lógica de negocio específica (validadores personalizados, paginación, filtrado, autenticación) más allá de las plantillas generadas automáticamente.

## 8. Build y despliegue

### 8.1 Scripts de `package.json`

| Script | Comando | Descripción |
|---|---|---|
| `npm start` | `ng serve` | Servidor de desarrollo (configuración `development` por defecto) |
| `npm run build` | `ng build` | Build de producción por defecto (`defaultConfiguration: production`) |
| `npm run watch` | `ng build --watch --configuration development` | Build en modo watch para desarrollo |
| `npm test` | `ng test` | Ejecuta la suite de tests con Karma |

### 8.2 Ejecución local (según README)

```bash
ng serve --port <puerto>
```
Requiere Node 14 LTS (aunque Angular 13 normalmente requiere Node ≥ 12.20, la recomendación del README es Node 14 LTS).

### 8.3 Docker (`Dockerfile`)

Build multi-stage:

```dockerfile
FROM node:14 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist/pokedex .
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

1. **Etapa `builder`**: imagen `node:14`, copia todo el repositorio, instala dependencias y ejecuta `npm run build` (genera `dist/pokedex`, build de **producción** por ser la configuración por defecto).
2. **Etapa final**: imagen `nginx:alpine` liviana, limpia el contenido por defecto de Nginx y copia el build estático generado.
3. Expone el sitio vía Nginx en el puerto 80 del contenedor.

Comandos (README):

```bash
docker build -t pokedex .
docker run --rm -it -p 8080:80 pokedex
# Disponible en http://localhost:8080/
```

> **Nota:** el `Dockerfile` usa `COPY . .` sin un `.dockerignore` para `node_modules`/`.git`; conviene añadir uno para reducir el contexto de build y evitar copiar artefactos innecesarios o archivos sensibles al contenedor.

## 9. Consideraciones de seguridad y limitaciones conocidas

Dado que la organización opera bajo cumplimiento **SOC 1 Type 2 / SOC 2 Type 2**, es importante documentar explícitamente que este proyecto, en su estado actual, **no es apto para producción con datos reales de usuarios** por los siguientes motivos:

1. **Contraseñas en texto plano**: `RegisterFormComponent` y `LoginFormComponent` manejan el password sin ningún hashing/cifrado, y `LocalStorageService` lo persiste **tal cual** en el `localStorage` del navegador (clave `"users"`). Cualquier script con acceso al DOM/`localStorage` (p. ej. un XSS) podría leer todas las credenciales registradas.
2. **"Autenticación" 100% client-side**: no hay backend, tokens, sesiones de servidor ni expiración. Cualquier usuario puede editar el `localStorage` manualmente para suplantar una sesión (`activeUser`) sin conocer ninguna contraseña.
3. **Sin protección contra XSS/CSRF a nivel de backend** (no aplica CSRF por no haber backend, pero sí aplica el riesgo de XSS dado que las credenciales quedan expuestas en `localStorage`, accesible por cualquier script en el mismo origen).
4. **Ausencia de HTTPS/CSP a nivel de aplicación**: la configuración de Nginx en el `Dockerfile` es la default de la imagen, sin cabeceras de seguridad (CSP, HSTS, X-Frame-Options, etc.).
5. **Dependencias con versiones antiguas**: Angular 13, Node 14 y TypeScript 4.4 están fuera de soporte LTS activo a la fecha; ambos han recibido EOL de sus respectivos ciclos de vida, por lo que no reciben parches de seguridad oficiales.

Estas observaciones son puramente informativas para esta documentación; no se realizaron cambios de código como parte de esta tarea.

## 10. Posibles mejoras futuras

- Sustituir la autenticación simulada por un backend real con hashing de contraseñas (bcrypt/argon2) y sesiones/JWT.
- Introducir `@angular/router` con rutas y `Guards` reales en lugar del `*ngSwitch` manual en `AppComponent`.
- Mover la URL base de la PokéAPI a los archivos de `environment.ts` / `environment.prod.ts`.
- Cargar el detalle de cada Pokémon en batch (o mediante un endpoint agregado) en lugar de una petición HTTP individual por tarjeta en `PokemonCardComponent.ngOnInit()`, lo cual genera hasta 50 peticiones simultáneas por página.
- Completar o eliminar `PokemonDetailComponent`, que actualmente es código muerto.
- Actualizar Angular/Node/TypeScript a versiones con soporte activo.
- Agregar pruebas unitarias reales para los validadores personalizados de contraseña, la lógica de paginación/filtrado del dashboard y el flujo de autenticación.

