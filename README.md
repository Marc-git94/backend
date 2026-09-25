# backend
# E-commerce Full Stack

## Nom del projecte
E-commerce Full Stack

## Tecnologies
- React
- Node.js / Express
- MongoDB
- Docker

## Autor
Marc Garcia Ruano

## Com executar el projecte

1. Clona aquest repositori
2. Instal·la les dependències:
   ```bash
   npm install
   ```
3. Configura les variables d'entorn necessàries (per exemple, la connexió a MongoDB) en un fitxer `.env`
4. Executa el servidor:
   ```bash
   npm start
   ```
5. L'API estarà disponible a `http://localhost:5000` (o el port configurat)

---

## Base de dades amb Docker (MongoDB)

Aquest projecte utilitza **Docker** i **Docker Compose** per aixecar la base de dades MongoDB en un contenidor, evitant haver-la d'instal·lar de forma local.

### Requisits previs

- Tenir Docker i Docker Compose instal·lats. Es pot comprovar amb:
  ```bash
  docker --version
  docker compose version
  ```
- Comprovar que Docker funciona correctament executant un contenidor de prova:
  ```bash
  docker run hello-world
  ```

### Estructura

La configuració de Docker es troba dins la carpeta `docker/`, amb el fitxer `docker-compose.yml` que defineix el servei `mongo`.

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
```

> El port intern del contenidor és el `27017` (per defecte de MongoDB), però es mapeja al port `27018` de la màquina amfitriona per evitar conflictes amb una altra instal·lació local de MongoDB.

### Aixecar els serveis

Des de la carpeta `docker/`:

```bash
cd docker
docker compose up -d
```

Comprovar que el contenidor està en marxa:

```bash
docker compose ps
```

### Aturar i eliminar els serveis

```bash
docker compose down
```

Si es vol eliminar també el volum de dades (per exemple, per reiniciar la base de dades des de zero amb noves credencials):

```bash
docker compose down -v
```

### Comprovar la connexió amb MongoDB Compass

Amb el contenidor en marxa, es pot comprovar l'accés a la base de dades utilitzant [MongoDB Compass](https://www.mongodb.com/products/compass) amb la següent cadena de connexió:

```
mongodb://marc:12345@localhost:27018/?authSource=admin
```

> El paràmetre `authSource=admin` és necessari perquè l'usuari root es crea a la base de dades `admin`.

### Variables d'entorn del backend

Per connectar el backend (Node.js/Express) amb el MongoDB del contenidor, cal configurar al fitxer `.env` una URI semblant a:

```
MONGO_URI=mongodb://marc:12345@localhost:27018/nom_de_la_bd?authSource=admin
```
