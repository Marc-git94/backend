# ADR-002: Estructura inicial del projecte

## Context

Cal decidir com organitzar el codi del backend (Node.js/Express + MongoDB) i del frontend (React) del projecte d'e-commerce VR: si es fan servir repositoris separats per a cada part, o un únic repositori (monorepo) que contingui totes dues.

## Decisió

Farem servir un **monorepo**: un únic repositori amb les carpetes `backend/` i `frontend/` al mateix nivell, i una carpeta comuna `docs/` per a diagrames i ADRs.

```
ecommerce-project/
├── backend/
├── frontend/
└── docs/
    ├── diagrams/
    └── adrs/
```

## Conseqüències

**Positives**
+ Més senzill de gestionar en un projecte acadèmic petit: un únic lloc on trobar tot el codi i la documentació.
+ Facilita mantenir sincronitzats els canvis entre backend i frontend (per exemple, quan canvia un endpoint de l'API).
+ Un sol `git clone` dona accés a tot el projecte.

**Negatives**
- Si el projecte creixés molt, el repositori es podria fer gran i menys àgil de clonar.
- No permet desplegar o versionar backend i frontend de forma totalment independent (per exemple, amb pipelines de CI/CD separats).
- Els permisos d'accés no es poden diferenciar per carpeta si en el futur hi treballen equips diferents.
