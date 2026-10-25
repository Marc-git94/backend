#!/bin/bash

API="${API:-http://localhost:3000/api/products}"
JSON="Content-Type: application/json"

pausa() {
  if [ -z "$NOPAUSE" ]; then
    echo
    read -r -p "Prem Enter per continuar... " _
  fi
}

prova() {
  local titol="$1"
  shift
  echo
  echo "=== $titol ==="
  curl -s -w "\nHTTP %{http_code}\n" "$@"
}

obtenir_id() {
  echo "$1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4
}

SORTIDA=$(prova "1. Crear un producte (esperat: HTTP 201)" -X POST "$API" -H "$JSON" \
  -d '{"nom":"Meta Quest 3","descripcio":"Casc de realitat mixta autònom","preu":549.99,"stock":15,"tipus":"casc"}')
echo "$SORTIDA"
ID=$(obtenir_id "$SORTIDA")

if [ -z "$ID" ]; then
  echo
  echo "No s'ha pogut obtenir l'_id. Comprova que l'API està en marxa."
  exit 1
fi

echo
echo "ID del producte creat: $ID"
pausa

prova "2. Llistar tots els productes (esperat: HTTP 200)" "$API"
pausa

prova "3. Obtenir el producte per id (esperat: HTTP 200)" "$API/$ID"
pausa

prova "4. Modificar el preu (esperat: HTTP 200, preu 499.99)" -X PUT "$API/$ID" -H "$JSON" \
  -d '{"preu":499.99}'
pausa

prova "5. Esborrar el producte (esperat: HTTP 204)" -X DELETE "$API/$ID"
pausa

prova "6. Obtenir el producte esborrat (esperat: HTTP 404)" "$API/$ID"
pausa

prova "7. Crear amb un tipus no vàlid (esperat: HTTP 422)" -X POST "$API" -H "$JSON" \
  -d '{"nom":"Prova","preu":10,"tipus":"altre"}'
pausa

prova "8. Id mal format (esperat: HTTP 400)" "$API/123"
pausa

prova "9. Id inexistent (esperat: HTTP 404)" "$API/65f000000000000000000000"
pausa

SORTIDA=$(prova "10. Crear un producte per provar la validació (esperat: HTTP 201)" -X POST "$API" -H "$JSON" \
  -d '{"nom":"Prova validacio","preu":10,"tipus":"joc"}')
echo "$SORTIDA"
ID2=$(obtenir_id "$SORTIDA")

if [ -z "$ID2" ]; then
  echo
  echo "No s'ha pogut obtenir l'_id del segon producte."
  exit 1
fi
pausa

prova "11. Modificar amb un preu negatiu (esperat: HTTP 422)" -X PUT "$API/$ID2" -H "$JSON" \
  -d '{"preu":-5}'
pausa

prova "12. Esborrar el producte de prova (esperat: HTTP 204)" -X DELETE "$API/$ID2"
pausa

prova "13. Llistat final (esperat: HTTP 200, sense productes)" "$API"
echo
