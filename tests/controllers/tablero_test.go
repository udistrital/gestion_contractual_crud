package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"
)

// Mensaje estándar de GetAll de los demás controladores.
const mensajeGetAll = "Error service GetAll: The request contains an incorrect parameter or no record exists"

// Pruebas sin base de datos: los filtros inválidos responden 400 antes de consultar.

func TestTableroFiltrosInvalidos(t *testing.T) {
	for _, ruta := range []string{"/v1/tableros/contratos"} {
		for _, filtro := range []string{
			"vigencia-id=abc", "vigencia-id=0", "vigencia-id=-1", "abogado-id=1.5",
			"dependencia-solicitante-id=31,", "dependencia-solicitante-id=31,x", "dependencia-solicitante-id=0",
		} {
			codigo, r := solicitar(t, http.MethodGet, ruta+"?"+filtro, "")
			if codigo != http.StatusBadRequest || r.Success || string(r.Status) != `"400"` {
				t.Fatalf("%s?%s: se esperaba 400, llegó %d %+v", ruta, filtro, codigo, r)
			}
		}
	}
}

func TestTableroSoloLectura(t *testing.T) {
	for _, ruta := range []string{"/v1/tableros/contratos"} {
		for _, metodo := range []string{http.MethodPost, http.MethodPut, http.MethodDelete} {
			if codigo, _ := solicitar(t, metodo, ruta, `{}`); codigo != http.StatusNotFound {
				t.Fatalf("%s %s no debe aceptar escrituras: se esperaba 404, llegó %d", metodo, ruta, codigo)
			}
		}
	}
	if codigo, _ := solicitar(t, http.MethodGet, "/v1/tableros", ""); codigo != http.StatusNotFound {
		t.Fatalf("/v1/tableros sin recurso: se esperaba 404, llegó %d", codigo)
	}
}

// Sin base de datos el ORM entra en pánico: BaseController.HandlerFunc lo
// responde 500 genérico, sin el detalle del error (igual que los demás controladores).
func TestTableroErrorDeBaseDeDatos(t *testing.T) {
	if os.Getenv("GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION") == "true" {
		t.Skip("con base de datos la consulta no falla")
	}
	codigo, r := solicitar(t, http.MethodGet, "/v1/tableros/contratos?vigencia-id=1", "")
	if codigo != http.StatusInternalServerError || r.Success || r.Message != "Error interno del servidor" || string(r.Data) != "null" {
		t.Fatalf("se esperaba 500 genérico, llegó %d %+v", codigo, r)
	}
}

// Prueba de integración contra PostgreSQL: formato de respuesta y lista vacía.
func TestTableroIntegracion(t *testing.T) {
	conectar(t)
	vigencia := crearVigenciaTablero(t)

	codigo, r := solicitar(t, http.MethodGet, fmt.Sprintf("/v1/tableros/contratos?vigencia-id=%d", vigencia), "")
	var contratos []map[string]interface{}
	_ = json.Unmarshal(r.Data, &contratos)
	if codigo != http.StatusOK || !r.Success || string(r.Status) != "200" || len(contratos) != 1 {
		t.Fatalf("contratos: %d %+v", codigo, r)
	}
	c := contratos[0]
	for _, campo := range []string{"contrato_general_id", "numero_contrato", "consecutivo_elaboracion", "vigencia_id", "fecha_final",
		"dependencia_solicitante_id", "estado_parametro_id", "fecha_estado", "abogado_id"} {
		if _, ok := c[campo]; !ok {
			t.Fatalf("falta %s en %s", campo, r.Data)
		}
	}
	if c["estado_parametro_id"] != float64(6773) || c["abogado_id"] != float64(500) || c["vigencia_id"] != float64(vigencia) {
		t.Fatalf("datos del contrato: %s", r.Data)
	}

	// Sin resultados: [] con 200.
	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("/v1/tableros/contratos?vigencia-id=%d", vigencia+1), "")
	if codigo != http.StatusOK || string(r.Data) != "[]" {
		t.Fatalf("sin resultados: %d %s", codigo, r.Data)
	}
}

// crearVigenciaTablero crea, por el API, un contrato con un estado registrado
// por un abogado en una vigencia que solo usa esta prueba.
func crearVigenciaTablero(t *testing.T) int {
	t.Helper()
	codigo, r := solicitar(t, http.MethodGet, "/v1/contratos-generales?sortby=Id&order=desc&limit=1&fields=Id", "")
	var ultimo []struct{ Id int }
	_ = json.Unmarshal(r.Data, &ultimo)
	if codigo != http.StatusOK {
		t.Fatalf("consultar el último contrato: %d", codigo)
	}
	vigencia := 3000000
	if len(ultimo) == 1 {
		vigencia += ultimo[0].Id
	}
	contrato := crear(t, "/v1/contratos-generales", fmt.Sprintf(`{"unidad_ejecutora_id":1,"vigencia_id":%d,"dependencia_solicitante_id":31}`, vigencia))
	crear(t, "/v1/estados-contrato", fmt.Sprintf(`{"contrato_general_id":{"id":%d},"estado_parametro_id":6773,"usuario_id":500,"usuario_rol":"ABOGADO_CONTRATACION_RECTOR"}`, contrato))
	return vigencia
}
