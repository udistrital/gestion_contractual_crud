package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/beego/beego/v2/server/web"
	"github.com/udistrital/utils_oas/v2/customerror"

	_ "github.com/udistrital/gestion_contractual_crud/routers"
)

// Pruebas de la capa HTTP que no necesitan base de datos: las validaciones
// responden antes de consultar o guardar.

func TestMain(m *testing.M) {
	// Lo mismo que copyrequestbody = true y autorender = false de conf/app.conf.
	web.BConfig.CopyRequestBody = true
	web.BConfig.WebConfig.AutoRender = false
	// Lo mismo que main.go: los errores los responde customerror de utils_oas.
	web.ErrorController(&customerror.CustomErrorController{})
	os.Exit(m.Run())
}

type respuesta struct {
	Success bool
	Status  string
	Message string
	Data    json.RawMessage
}

func solicitar(t *testing.T, metodo, ruta, cuerpo string) (int, respuesta) {
	t.Helper()
	req := httptest.NewRequest(metodo, ruta, bytes.NewReader([]byte(cuerpo)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	web.BeeApp.Handlers.ServeHTTP(rec, req)
	var r respuesta
	_ = json.Unmarshal(rec.Body.Bytes(), &r)
	return rec.Code, r
}

func TestIdInvalidoResponde400(t *testing.T) {
	for _, ruta := range []string{"/v1/poliza/abc", "/v1/contrato_general/0", "/v1/acta_inicio/-3"} {
		codigo, r := solicitar(t, http.MethodGet, ruta, "")
		if codigo != http.StatusBadRequest || r.Success || r.Status != "400" {
			t.Fatalf("%s: se esperaba 400, llegó %d %+v", ruta, codigo, r)
		}
	}
}

func TestCuerpoNoEsJSON(t *testing.T) {
	codigo, r := solicitar(t, http.MethodPost, "/v1/convenio", `{"ContratoGeneralId":`)
	if codigo != http.StatusBadRequest || r.Message != "Error service POST: The request contains an incorrect data type or an invalid parameter" {
		t.Fatalf("se esperaba 400, llegó %d %+v", codigo, r)
	}
}

func TestTipoInvalido(t *testing.T) {
	codigo, _ := solicitar(t, http.MethodPost, "/v1/contrato_general", `{"UnidadEjecutoraId":"uno"}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestCampoObligatorio(t *testing.T) {
	codigo, r := solicitar(t, http.MethodPost, "/v1/poliza", `{"NumeroPoliza":"P-1"}`)
	var errores []string
	_ = json.Unmarshal(r.Data, &errores)
	if codigo != http.StatusBadRequest || len(errores) != 1 || errores[0] != "ContratoGeneralId es obligatorio" {
		t.Fatalf("se esperaba 400 por ContratoGeneralId, llegó %d %v", codigo, errores)
	}
}

func TestRelacionSinId(t *testing.T) {
	codigo, _ := solicitar(t, http.MethodPost, "/v1/amparo_poliza", `{"ContratoGeneralId":{},"AmparoId":1}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestLongitudMaxima(t *testing.T) {
	largo := string(bytes.Repeat([]byte("x"), 51))
	codigo, _ := solicitar(t, http.MethodPost, "/v1/poliza", `{"ContratoGeneralId":{"Id":1},"NumeroPoliza":"`+largo+`"}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestEntidadDeDocumento(t *testing.T) {
	codigo, _ := solicitar(t, http.MethodPost, "/v1/documento_contrato", `{"EntidadTipo":"solicitante","EntidadId":1}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestQueryMalFormado(t *testing.T) {
	codigo, r := solicitar(t, http.MethodGet, "/v1/poliza?query=NumeroPoliza", "")
	if codigo != http.StatusBadRequest || r.Message != "Error service GetAll: The request contains an incorrect parameter or no record exists" {
		t.Fatalf("se esperaba 400, llegó %d %+v", codigo, r)
	}
}

func TestTablasRetiradasNoTienenRuta(t *testing.T) {
	for _, ruta := range []string{"/v1/contratista", "/v1/lugar_ejecucion", "/v1/solicitante"} {
		if codigo, _ := solicitar(t, http.MethodGet, ruta, ""); codigo != http.StatusNotFound {
			t.Fatalf("%s: se esperaba 404, llegó %d", ruta, codigo)
		}
	}
}
