#!/usr/bin/env bash
# Pruebas funcionales de los endpoints de poliza y amparo_poliza.
#
# Requiere la aplicación corriendo y una base con el esquema de
# sql/creacion-tablas.sql y los contratos generales 1 y 2 sembrados
# (ver "Pruebas funcionales" en el README).
#
#   ./test/funcionales-poliza.sh [url_base]
#
# Sale con código 1 si alguna prueba no obtiene el estado esperado.

set -uo pipefail

API="${1:-http://localhost:8099}"
PP='import sys,json;print(json.dumps(json.load(sys.stdin),indent=2,ensure_ascii=False))'
CUERPO=$(mktemp)
trap 'rm -f "$CUERPO"' EXIT

N=0
OK=0
FALLOS=0

req() {
  local titulo="$1" metodo="$2" ruta="$3" cuerpo="$4" esperado="$5"
  N=$((N + 1))
  echo "### ${N}. $titulo"
  echo
  echo '```http'
  echo "$metodo $ruta"
  if [ -n "$cuerpo" ]; then
    echo "Content-Type: application/json"
    echo
    echo "$cuerpo" | python3 -c "$PP"
  fi
  echo

  local code
  if [ -n "$cuerpo" ]; then
    code=$(curl -s -o "$CUERPO" -w '%{http_code}' -X "$metodo" "$API$ruta" \
      -H 'Content-Type: application/json' -d "$cuerpo")
  else
    code=$(curl -s -o "$CUERPO" -w '%{http_code}' -X "$metodo" "$API$ruta")
  fi

  echo "--> HTTP $code (esperado $esperado)"
  python3 -c "$PP" <"$CUERPO" 2>/dev/null || cat "$CUERPO"
  echo '```'
  echo
  if [ "$code" = "$esperado" ]; then
    OK=$((OK + 1))
    echo "Resultado: **OK**"
  else
    FALLOS=$((FALLOS + 1))
    echo "Resultado: **FALLO** (se esperaba $esperado y se obtuvo $code)"
  fi
  echo
}

echo "## Momento 1 — los amparos se registran con la minuta, sin póliza"
echo
req "Crear el lote de amparos del contrato 1, sin poliza_id" \
  POST /amparos-polizas \
  '[{"contrato_general_id":1,"amparo_id":1,"tipo_valor_amparo_id":1,"suficiencia":20,"valor":17000000,"descripcion":"Amparo de cumplimiento del contrato","fecha_inicio":"2026-01-15","fecha_fin":"2026-12-15"},{"contrato_general_id":1,"amparo_id":2,"tipo_valor_amparo_id":1,"suficiencia":5,"valor":4250000,"descripcion":"Amparo de calidad del servicio","fecha_inicio":"2026-01-15","fecha_fin":"2026-12-15"}]' \
  201

req "Listar los amparos registrados" GET /amparos-polizas '' 200

req "Consultar un amparo por ID" GET /amparos-polizas/1 '' 200

req "Filtrar los amparos por contrato" \
  GET '/amparos-polizas?query=%7B%22contrato_general_id%22%3A1%7D' '' 200

echo "## Momento 2 — se expide la póliza y se asocian los amparos"
echo
req "Crear la póliza del contrato 1" \
  POST /polizas \
  '{"numero_poliza":"POL-2026-0001","entidad_aseguradora_id":3,"contrato_general_id":1,"descripcion":"Póliza de cumplimiento CTO-2026-001","fecha_inicio":"2026-01-15","fecha_fin":"2026-12-15","fecha_expedicion":"2026-01-10","fecha_aprobacion":"2026-01-12","usuario_id":101}' \
  201

req "Listar las pólizas" GET /polizas '' 200

req "Consultar la póliza por ID" GET /polizas/1 '' 200

req "Asociar el primer amparo a la póliza expedida" \
  PUT /amparos-polizas/1 '{"poliza_id":1}' 200

req "Asociar el segundo amparo a la misma póliza" \
  PUT /amparos-polizas/2 '{"poliza_id":1}' 200

req "Consultar los amparos cubiertos por la póliza" GET /polizas/1/amparos '' 200

req "Actualizar datos de la póliza" \
  PUT /polizas/1 '{"descripcion":"Póliza de cumplimiento CTO-2026-001 (actualizada)","fecha_aprobacion":"2026-01-14"}' 200

echo "## Validaciones de negocio"
echo
req "Expedir una póliza para otro contrato (CTO-2026-002)" \
  POST /polizas \
  '{"numero_poliza":"POL-2026-0002","entidad_aseguradora_id":4,"contrato_general_id":2,"descripcion":"Póliza de cumplimiento CTO-2026-002","fecha_inicio":"2026-02-01","fecha_fin":"2026-11-30","fecha_expedicion":"2026-01-28","fecha_aprobacion":"2026-01-30","usuario_id":101}' \
  201

req "Rechazo: asociar un amparo del contrato 1 a la póliza del contrato 2" \
  PUT /amparos-polizas/1 '{"poliza_id":2}' 400

req "Rechazo: crear una póliza con fecha_inicio posterior a fecha_fin" \
  POST /polizas \
  '{"numero_poliza":"POL-2026-0003","entidad_aseguradora_id":3,"contrato_general_id":1,"fecha_inicio":"2026-12-15","fecha_fin":"2026-01-15"}' \
  400

req "Rechazo: crear una póliza sobre un contrato inexistente" \
  POST /polizas \
  '{"numero_poliza":"POL-2026-0004","entidad_aseguradora_id":3,"contrato_general_id":9999,"fecha_inicio":"2026-01-15","fecha_fin":"2026-12-15"}' \
  404

req "Consultar una póliza inexistente" GET /polizas/9999 '' 404

req "Consultar un amparo inexistente" GET /amparos-polizas/9999 '' 404

echo "## Creación en lote parcial"
echo
req "Lote mixto: un amparo válido y otro sobre un contrato inexistente" \
  POST /amparos-polizas \
  '[{"contrato_general_id":1,"amparo_id":3,"tipo_valor_amparo_id":1,"suficiencia":10,"valor":8500000,"descripcion":"Amparo de salarios y prestaciones","fecha_inicio":"2026-01-15","fecha_fin":"2026-12-15"},{"contrato_general_id":9999,"amparo_id":4,"tipo_valor_amparo_id":1,"suficiencia":10,"valor":8500000,"descripcion":"Amparo sobre contrato inexistente","fecha_inicio":"2026-01-15","fecha_fin":"2026-12-15"}]' \
  206

echo "## Borrado lógico"
echo
req "Eliminar lógicamente un amparo" DELETE /amparos-polizas/2 '' 200

req "El amparo eliminado sigue existiendo con activo=false" GET /amparos-polizas/2 '' 200

req "Eliminar lógicamente la póliza" DELETE /polizas/1 '' 200

req "La póliza eliminada sigue existiendo con activo=false" GET /polizas/1 '' 200

echo "---"
echo
echo "Total: $N | OK: $OK | Fallos: $FALLOS"
[ "$FALLOS" -eq 0 ] || exit 1
