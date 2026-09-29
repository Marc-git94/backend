# ADR-001: Base de dades del projecte

## Context

Necessitem una base de dades per emmagatzemar usuaris, productes VR, comandes i ressenyes. El model de dades encara pot evolucionar (nous tipus de producte VR, nous atributs específics segons el tipus de maquinari o joc), i algunes entitats tenen estructures no del tot rígides.

## Decisió

Farem servir **MongoDB** com a base de dades principal, gestionada mitjançant **Docker** (contenidor `mongo` amb volum persistent).

## Conseqüències

**Positives**
+ Flexibilitat per afegir nous camps o entitats sense migracions complexes (útil per a productes VR amb atributs molt variables: resolució, tipus de connexió, compatibilitat, etc.).
+ Bona integració amb Node.js/Express (via Mongoose).
+ Fàcil desplegament i replicabilitat de l'entorn gràcies a Docker Compose.

**Negatives**
- Menys adequat per a consultes molt relacionals (per exemple, informes complexos que creuin moltes entitats).
- Cal gestionar manualment la integritat referencial entre col·leccions (MongoDB no imposa claus foranes).
- Requereix dissenyar bé els esquemes des del principi per evitar inconsistències de dades.
