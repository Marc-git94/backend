# E-commerce Full Stack (VR) — Backend

## Nom del projecte
E-commerce Full Stack: botiga en línia de productes de realitat virtual (cascs VR, jocs i accessoris).

## Tecnologies
- React
- Node.js / Express
- MongoDB (Mongoose)
- Docker

## Autor
Marc Garcia Ruano

## Estructura del repositori

```
backend/
├── api/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/productController.js
│   │   ├── models/
│   │   │   ├── Producte.js
│   │   │   └── Usuari.js
│   │   ├── routes/productRoutes.js
│   │   ├── services/productService.js
│   │   └── index.js
│   ├── .gitignore
│   └── package.json
├── docker/
│   └── docker-compose.yml
└── docs/
    ├── adrs/
    │   ├── ADR-001-base-de-dades.md
    │   └── ADR-002-estructura-projecte.md
    └── diagrams/
        └── domain-diagram.png
```

## Com executar el projecte

1. Clona aquest repositori.
2. Aixeca la base de dades amb Docker (vegeu la secció [Base de dades amb Docker](#base-de-dades-amb-docker-mongodb)):
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
4. Crea un fitxer `.env` dins de `api/` amb les variables d'entorn:
   ```
   PORT=3000
   MONGO_URI=mongodb://marc:12345@localhost:27018/ecommerce?authSource=admin
   ```
5. Executa el servidor:
   ```bash
   npm run dev     # desenvolupament (nodemon, es reinicia en desar)
   npm start       # execució normal
   ```
6. L'API estarà disponible a `http://localhost:3000` (o el port configurat al `.env`).

Si tot va bé, a la consola apareixen els missatges `Servidor escoltant al port 3000` i `MongoDB connectat correctament`.

> El fitxer `.env` conté credencials i **no es puja al repositori** (està al `.gitignore`).

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

- **Port:** el contenidor escolta al `27017` (per defecte de MongoDB), però es mapeja al `27018` de la màquina amfitriona per evitar conflictes amb una altra instal·lació local de MongoDB.
- **Volum:** `mongo_data` es munta a `/data/db`, la carpeta on MongoDB guarda les dades. Així les dades **persisteixen** encara que s'elimini el contenidor.
- **Credencials:** només s'apliquen la primera vegada que es crea el volum de dades. Si es canvien després, cal esborrar el volum (`docker compose down -v`) perquè tinguin efecte.

### Comandes útils

Des de la carpeta `docker/`:

```bash
docker compose up -d       # aixecar el servei
docker compose ps          # comprovar que està en marxa
docker compose down        # aturar i eliminar el contenidor (les dades es conserven)
docker compose down -v     # aturar i eliminar també el volum (esborra les dades)
```

### Comprovar la connexió amb MongoDB Compass

Amb el contenidor en marxa, es pot comprovar l'accés amb [MongoDB Compass](https://www.mongodb.com/products/compass) utilitzant:

```
mongodb://marc:12345@localhost:27018/?authSource=admin
```

El paràmetre `authSource=admin` és necessari perquè l'usuari root es crea a la base de dades `admin`.

---

## Model de domini

El diagrama conceptual amb les entitats, atributs i cardinalitats es troba a [`docs/diagrams/domain-diagram.png`](docs/diagrams/domain-diagram.png).

![Diagrama de domini](docs/diagrams/domain-diagram.png)

Entitats principals:

| Entitat | Descripció |
|---|---|
| **Usuari** | Client o administrador de la botiga |
| **Producte** | Casc VR, joc o accessori |
| **Categoria** | Agrupa els productes |
| **Comanda** i **LiniaComanda** | Compra d'un usuari i els productes que conté (relació N..M entre Comanda i Producte) |
| **Pagament** | Pagament associat a una comanda (1..1) |
| **Ressenya** | Opinió d'un usuari sobre un producte |
| **Adreça** i **UsuariAdreça** | Adreces dels usuaris (relació N..M a través de la taula intermèdia) |
| **Visualització** | Relació directa Usuari–Producte amb la data de visualització, per guardar els productes que ha vist l'usuari identificat |

## Decisions d'arquitectura (ADR)

Les decisions importants estan documentades a [`docs/adrs/`](docs/adrs/):

- [ADR-001: Base de dades del projecte](docs/adrs/ADR-001-base-de-dades.md) — MongoDB gestionat amb Docker.
- [ADR-002: Estructura inicial del projecte](docs/adrs/ADR-002-estructura-projecte.md) — monorepo amb `backend/` i `frontend/`.

---

## API REST

### Arquitectura en capes

L'API segueix el principi de *Separation of Concerns*. Cada petició segueix aquest recorregut:

```
Request HTTP → [RUTA] → [CONTROLADOR] → [SERVEI] → [MODEL] → Base de dades
```

| Capa | Fitxer | Responsabilitat |
|---|---|---|
| Ruta | `routes/productRoutes.js` | Defineix l'endpoint i el mètode HTTP |
| Controlador | `controllers/productController.js` | Gestiona la part HTTP: llegeix `req`, envia `res` i decideix el codi d'estat |
| Servei | `services/productService.js` | Lògica de negoci i accés al model |
| Model | `models/Producte.js` | Esquema de Mongoose amb validacions |

`src/index.js` carrega la configuració, connecta a la base de dades i munta les rutes sota el prefix `/api/products`.

### Endpoints de productes

| Mètode | Ruta | Descripció | Codis de resposta |
|---|---|---|---|
| GET | `/` | Comprovació que l'API funciona | 200 |
| GET | `/api/products` | Llista tots els productes | 200 |
| GET | `/api/products/:id` | Obté un producte pel seu id | 200, 400, 404 |
| POST | `/api/products` | Crea un producte | 201, 400 |
| PUT | `/api/products/:id` | Modifica un producte | 200, 400, 404 |
| DELETE | `/api/products/:id` | Elimina un producte | 200, 400, 404 |

Codis: `200` correcte · `201` creat · `400` dades o id no vàlids · `404` producte no trobat · `500` error del servidor.

Format de les respostes:

```json
{ "status": "success", "data": { } }
{ "status": "error", "message": "descripció de l'error" }
```

### Exemple: crear un producte

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Meta Quest 3",
    "descripcio": "Casc de realitat mixta autònom",
    "preu": 549.99,
    "stock": 15,
    "tipus": "casc",
    "imatgeURL": "https://example.com/quest3.jpg"
  }'
```

### Validacions del producte

- `nom`, `preu` i `tipus` són obligatoris.
- `tipus` només pot ser `casc`, `joc` o `accessori`.
- `preu` no pot ser negatiu i té com a màxim 2 decimals.
- `stock` ha de ser un enter igual o superior a 0.
- `imatgeURL` ha de començar per `http://` o `https://`.

Les validacions s'apliquen també en modificar un producte (`runValidators`).

---

## Errors comuns i depuració

| Problema | Causa i solució |
|---|---|
| `authentication failed` a Compass o a l'API | Les credencials del `docker-compose.yml` només s'apliquen en crear el volum. Si s'han canviat, cal fer `docker compose down -v` i tornar a aixecar el servei. |
| Autenticació falla amb credencials correctes | El `docker-compose.yml` pot tenir finals de línia de Windows (CRLF). Es corregeix amb `sed -i 's/\r$//' docker-compose.yml`. |
| Port `27017` ocupat | Hi ha un altre MongoDB local. Per això el contenidor s'exposa al `27018`. |
| `MONGO_URI` indefinit | El `.env` no s'ha carregat: ha d'estar a `api/`, amb aquest nom exacte, i s'ha d'executar `npm run dev` des d'aquesta carpeta. |
| `EADDRINUSE` (port 3000 ocupat) | Canviar `PORT` al `.env`. |
| Índexs duplicats | Mongo no elimina els índexs antics en canviar el model; cal esborrar-los manualment (`db.<col·lecció>.dropIndex(...)`). |

---

## Estat del projecte

- [x] Docker i Docker Compose amb MongoDB i volum persistent
- [x] Diagrama de domini i ADRs
- [x] Projecte Node.js amb Express, Mongoose i variables d'entorn
- [x] Esquemes de `Usuari` i `Producte` amb validacions
- [x] Arquitectura en capes (rutes, controladors, serveis)
- [x] CRUD complet de `Producte`
- [ ] Endpoints de la resta d'entitats (properes sessions)
