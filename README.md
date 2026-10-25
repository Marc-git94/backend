# E-commerce Full Stack (VR) — Backend

## Nom del projecte
E-commerce Full Stack: botiga en línia de productes de realitat virtual (cascs VR, jocs i accessoris).

## Tecnologies
- React
- Node.js / Express
- MongoDB (Mongoose)
- Docker
- bcrypt (hash de contrasenyes)
- Postman (verificació de l'API)

## Autor
Marc Garcia Ruano

## Estructura del repositori

```
backend/
├── api/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/      (product, category, user)
│   │   ├── middleware/errorHandler.js
│   │   ├── models/           (Producte, Category, User)
│   │   ├── routes/           (product, category, user)
│   │   ├── services/         (product, category, user)
│   │   ├── utils/            (AppError, asyncHandler, queryHelpers)
│   │   ├── app.js
│   │   └── index.js
│   ├── postman/
│   │   ├── ecommerce.postman_collection.json
│   │   └── ecommerce-local.postman_environment.json
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── docker/
│   └── docker-compose.yml
├── docs/
│   ├── adrs/
│   └── diagrams/
└── README.md
```

## Com executar el projecte

1. Clona aquest repositori.
2. Aixeca la base de dades amb Docker (vegeu [Base de dades amb Docker](#base-de-dades-amb-docker-mongodb)):
   ```bash
   cd docker
   docker compose up -d
   cd ..
   ```
3. Entra a la carpeta de l'API i instal·la les dependències:
   ```bash
   cd api
   npm install
   ```
4. Crea el fitxer `.env` a partir de l'exemple i ajusta les credencials:
   ```bash
   cp .env.example .env
   ```
   ```
   PORT=3000
   MONGO_URI=mongodb://usuari:contrasenya@localhost:27018/ecommerce?authSource=admin
   ```
5. Executa el servidor:
   ```bash
   npm run dev     # desenvolupament (nodemon, es reinicia en desar)
   npm start       # execució normal
   ```
6. L'API estarà disponible a `http://localhost:3000` (o el port configurat al `.env`).

Si tot va bé, a la consola apareixen `Servidor escoltant al port 3000` i `MongoDB connectat correctament`.

> El fitxer `.env` conté credencials i **no es puja al repositori** (està al `.gitignore`). `.env.example` només porta valors d'exemple.

---

## Base de dades amb Docker (MongoDB)

El projecte utilitza **Docker** i **Docker Compose** per aixecar MongoDB en un contenidor, sense haver-lo d'instal·lar de forma local.

### Requisits previs

- Tenir Docker i Docker Compose instal·lats. Es pot comprovar amb:
  ```bash
  docker --version
  docker compose version
  ```
- Comprovar que Docker funciona executant un contenidor de prova:
  ```bash
  docker run hello-world
  ```

### Configuració

La configuració es troba a `docker/docker-compose.yml`, que defineix el servei `mongo`:

```yaml
services:
  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: marc
      MONGO_INITDB_ROOT_PASSWORD: 12345
    ports:
      - "27018:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

- **Port:** el contenidor escolta al `27017`, però es mapeja al `27018` de la màquina amfitriona per evitar conflictes amb una altra instal·lació local de MongoDB.
- **Volum:** `mongo_data` es munta a `/data/db`, així les dades **persisteixen** encara que s'elimini el contenidor.
- **Credencials:** només s'apliquen la primera vegada que es crea el volum. Si es canvien després, cal esborrar-lo (`docker compose down -v`).

### Comandes útils

Des de la carpeta `docker/`:

```bash
docker compose up -d       # aixecar el servei
docker compose ps          # comprovar que està en marxa
docker compose logs mongo  # veure els logs de MongoDB
docker compose down        # aturar i eliminar el contenidor (les dades es conserven)
docker compose down -v     # aturar i eliminar també el volum (esborra les dades)
```

### Comprovar la connexió amb MongoDB Compass

```
mongodb://marc:12345@localhost:27018/?authSource=admin
```

El paràmetre `authSource=admin` és necessari perquè l'usuari root es crea a la base de dades `admin`. Les dades de l'API queden a la base `ecommerce`, a les col·leccions `productes`, `categories` i `users`.

---

## Model de domini

El diagrama conceptual amb les entitats, atributs i cardinalitats es troba a [`docs/diagrams/domain-diagram.png`](docs/diagrams/domain-diagram.png).

![Diagrama de domini](docs/diagrams/domain-diagram.png)

| Entitat | Descripció |
|---|---|
| **Usuari** (`User` al codi) | Client o administrador de la botiga |
| **Producte** | Casc VR, joc o accessori |
| **Categoria** (`Category` al codi) | Agrupa els productes; un producte en referencia una amb `category` |
| **Comanda** i **LiniaComanda** | Compra d'un usuari i els productes que conté (N..M) |
| **Pagament** | Pagament associat a una comanda (1..1) |
| **Ressenya** | Opinió d'un usuari sobre un producte |
| **Adreça** i **UsuariAdreça** | Adreces dels usuaris (N..M a través de la taula intermèdia) |
| **Visualització** | Relació directa Usuari–Producte amb la data de visualització |

## Decisions d'arquitectura (ADR)

- [ADR-001: Base de dades del projecte](docs/adrs/ADR-001-base-de-dades.md) — MongoDB gestionat amb Docker.
- [ADR-002: Estructura inicial del projecte](docs/adrs/ADR-002-estructura-projecte.md) — monorepo amb `backend/` i `frontend/`.

---

## API REST

### Arquitectura en capes

```
Request HTTP → [RUTA] → [CONTROLADOR] → [SERVEI] → [MODEL] → Base de dades
```

| Capa | Responsabilitat |
|---|---|
| Ruta (`routes/`) | Defineix l'endpoint i el mètode HTTP |
| Controlador (`controllers/`) | Part HTTP: llegeix `req`, envia `res` i el codi d'estat |
| Servei (`services/`) | Lògica de negoci, validacions i accés al model |
| Model (`models/`) | Esquema de Mongoose amb validacions |
| Middleware (`middleware/errorHandler.js`) | Gestió centralitzada d'errors |

`src/app.js` configura Express i munta les rutes; `src/index.js` carrega el `.env`, connecta a MongoDB i arrenca el servidor.

### Endpoints

| Recurs | Mètode | Ruta | Operació | Resposta |
|---|---|---|---|---|
| Productes | POST | `/api/products` | Crear | 201 |
| | GET | `/api/products` | Llistar | 200 |
| | GET | `/api/products/:id` | Consultar | 200 |
| | PUT | `/api/products/:id` | Modificar | 200 |
| | DELETE | `/api/products/:id` | Eliminar | 204 |
| Categories | POST | `/api/categories` | Crear | 201 |
| | GET | `/api/categories` | Llistar (filtres i paginació) | 200 |
| | GET | `/api/categories/:id` | Consultar | 200 |
| | PUT | `/api/categories/:id` | Modificar | 200 |
| | DELETE | `/api/categories/:id` | Eliminar | 204 |
| Usuaris | POST | `/api/users` | Crear | 201 |
| | GET | `/api/users` | Llistar (filtres i paginació) | 200 |
| | GET | `/api/users/:id` | Consultar | 200 |
| | PUT | `/api/users/:id` | Modificar | 200 |
| | DELETE | `/api/users/:id` | Desactivar (`active=false`) | 204 |

Els productes retornen la categoria amb `populate()` (camps `name` i `slug`).

### Format de les respostes

Èxit:

```json
{ "success": true, "data": { } }
```

Llistats (categories i usuaris):

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les dades no són vàlides",
    "details": [{ "field": "email", "message": "Format incorrecte" }]
  }
}
```

No es mostren traces internes ni dades sensibles; els errors inesperats retornen només `INTERNAL_ERROR`.

### Codis d'estat

| Codi | Significat | Quan es retorna |
|---|---|---|
| 200 | OK | Consulta o modificació correcta |
| 201 | Created | Recurs creat |
| 204 | No Content | Eliminació o desactivació |
| 400 | Bad Request | ID invàlid (`INVALID_ID`), JSON mal format (`INVALID_JSON`), paràmetres de consulta incorrectes (`INVALID_QUERY`) |
| 404 | Not Found | Recurs o ruta inexistent |
| 409 | Conflict | Slug o email duplicat (`DUPLICATE_KEY`) |
| 422 | Unprocessable Content | Error de validació (`VALIDATION_ERROR`) |
| 500 | Internal Server Error | Error inesperat |

### Filtres, ordenació i paginació

Disponibles a `GET /api/categories` i `GET /api/users`:

| Paràmetre | Descripció |
|---|---|
| `active=true\|false` | Filtra per estat |
| `name=text` | Cerca parcial, sense distingir majúscules |
| `sort=camp` / `sort=-camp` | Ordena ascendent o descendent. Camps permesos: categories `name`, `slug`, `createdAt`, `updatedAt`; usuaris `name`, `email`, `createdAt`, `updatedAt` |
| `page` i `limit` | Paginació; enters positius, `limit` per defecte 10 i màxim 50 |

```
GET /api/categories?active=true
GET /api/categories?name=info
GET /api/categories?sort=name
GET /api/users?name=anna
GET /api/users?sort=-createdAt
GET /api/users?page=2&limit=5
```

### Usuaris i seguretat

- La contrasenya (mínim 12 caràcters) es guarda només com a **hash amb bcrypt**; `passwordHash` mai es retorna en cap resposta.
- El servidor assigna `role=client`; el body només pot portar `name`, `email` i `password`. Qualsevol altre camp (`role`, `passwordHash`, `active`...) es rebutja amb un 422.
- La baixa és lògica: `DELETE` posa `active=false`.
- **Atenció:** fins que s'implementin JWT i control d'accés per rols, aquests endpoints només s'han d'utilitzar en local amb dades fictícies i no s'han de desplegar públicament.

### Validacions principals

- **Categoria:** `name` obligatori (mínim 3 caràcters), `slug` obligatori, únic i en format `minuscules-amb-guions`, `description` opcional (màxim 500), `active` per defecte `true`.
- **Usuari:** `name` (mínim 2), `email` amb format vàlid i únic, `password` (mínim 12 caràcters).
- **Producte:** `nom`, `preu` i `tipus` obligatoris; `tipus` ∈ `casc`, `joc`, `accessori`; `preu` ≥ 0 amb màxim 2 decimals; `stock` enter ≥ 0; `category` ha de ser l'id d'una categoria existent.

Les validacions s'apliquen també en modificar (`runValidators`).

---

## Verificació amb Postman

La col·lecció i l'entorn són a [`api/postman/`](api/postman/).

1. A Postman, **Import** i selecciona `ecommerce.postman_collection.json` i `ecommerce-local.postman_environment.json`.
2. Tria l'entorn **Ecommerce Local** (defineix `baseUrl=http://localhost:3000`; totes les URL fan servir `{{baseUrl}}`).
3. Amb l'API en marxa, executa la col·lecció **Ecommerce API** amb el *Runner* (carpetes en ordre: Products, Categories, Users) o les peticions una a una.

La col·lecció guarda els identificadors i els valors únics (slug, email) en variables pròpies, de manera que es pot executar diverses vegades. Les contrasenyes dels cossos són fictícies.

Proves automàtiques mínimes (scripts de Postman):

1. Categoria correcta (201)
2. Categoria sense nom (422)
3. Slug duplicat (409)
4. Usuari correcte (201)
5. Email duplicat (409)
6. Cap resposta exposa `passwordHash`

## Comprovació a MongoDB Compass

Amb la connexió del contenidor (port `27018`), a la base `ecommerce`:

- `categories`: categories creades i modificades, amb `createdAt` i `updatedAt`.
- `productes`: camp `category` amb l'`ObjectId` de la categoria assignada.
- `users`: camp `passwordHash` amb un hash (`$2b$...`), mai la contrasenya; usuaris desactivats amb `active: false`.
- Pestanya **Indexes**: índexs únics `slug_1` (categories) i `email_1` (users).

---

## Errors comuns i depuració

| Problema | Causa i solució |
|---|---|
| `authentication failed` a Compass o a l'API | Les credencials del `docker-compose.yml` només s'apliquen en crear el volum. Si s'han canviat, `docker compose down -v` i tornar a aixecar. |
| Autenticació falla amb credencials correctes | `docker-compose.yml` amb finals de línia CRLF. Es corregeix amb `sed -i 's/\r$//' docker-compose.yml`. |
| Port `27017` ocupat | Hi ha un altre MongoDB local; per això el contenidor s'exposa al `27018`. |
| `MONGO_URI` indefinit | El `.env` ha d'estar a `api/`, amb aquest nom exacte, i `npm run dev` s'ha d'executar des d'aquesta carpeta. |
| `EADDRINUSE` (port 3000 ocupat) | Canviar `PORT` al `.env`. |
| Les actualitzacions no validen | Cal passar `runValidators: true` a `findByIdAndUpdate`. |
| Error de duplicat com a 500 | `unique` no és una validació sinó un índex: l'error `11000` es tradueix a 409 al middleware. |
| `req.body` buit | Falta la capçalera `Content-Type: application/json` o `express.json()`. |
| Índexs duplicats o antics | Mongo no elimina els índexs en canviar el model; cal esborrar-los manualment (`db.<col·lecció>.dropIndex(...)`). |

---

## Estat del projecte

- [x] Docker i Docker Compose amb MongoDB i volum persistent
- [x] Diagrama de domini i ADRs
- [x] Projecte Node.js amb Express, Mongoose i variables d'entorn
- [x] Arquitectura en capes (rutes, controladors, serveis)
- [x] CRUD de productes
- [x] CRUD de categories amb referència des dels productes
- [x] CRUD d'usuaris amb contrasenyes amb hash
- [x] Validacions, codis HTTP i errors centralitzats
- [x] Filtres, ordenació i paginació
- [x] Col·lecció de Postman amb proves automàtiques
- [ ] Autenticació amb JWT i control d'accés per rols
- [ ] Endpoints de la resta d'entitats (comandes, ressenyes...)
