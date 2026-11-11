package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

func TestDisponibilidadPresupuestalController(t *testing.T) {
	probarCrud(t, "/v1/disponibilidades-presupuestales")
}

// valor_a_tomar: parte del CDP que toma el contrato. Se guarda con decimales,
// un PUT sin el campo lo conserva y se puede filtrar en GetAll.
func TestDisponibilidadPresupuestalValorATomar(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contratos-generales", `{"unidad_ejecutora_id":1,"vigencia_id":2026}`)
	ruta := "/v1/disponibilidades-presupuestales"
	cdp := crear(t, ruta, fmt.Sprintf(`{"contrato_general_id":{"id":%d},"numero_cdp_id":1234,"vigencia_cdp_id":2026,"valor_a_tomar":45000000.5}`, contrato))
	uno := fmt.Sprintf("%s/%d", ruta, cdp)

	leer := func(cuerpo json.RawMessage) *float64 {
		var d struct {
			ValorATomar *float64 `json:"valor_a_tomar"`
		}
		_ = json.Unmarshal(cuerpo, &d)
		return d.ValorATomar
	}

	codigo, r := solicitar(t, http.MethodGet, uno, "")
	if v := leer(r.Data); codigo != http.StatusOK || v == nil || *v != 45000000.5 {
		t.Fatalf("GetOne: %d %s", codigo, r.Data)
	}

	// PUT sin valor_a_tomar no lo cambia.
	codigo, r = solicitar(t, http.MethodPut, uno, `{"vigencia_cdp_id":2027}`)
	if v := leer(r.Data); codigo != http.StatusOK || v == nil || *v != 45000000.5 {
		t.Fatalf("PUT sin valor_a_tomar: %d %s", codigo, r.Data)
	}

	codigo, r = solicitar(t, http.MethodPut, uno, `{"valor_a_tomar":30000000}`)
	if v := leer(r.Data); codigo != http.StatusOK || v == nil || *v != 30000000 {
		t.Fatalf("PUT con valor_a_tomar: %d %s", codigo, r.Data)
	}

	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("%s?query=contrato_general_id.id:%d,valor_a_tomar__gte:30000000", ruta, contrato), "")
	var lista []json.RawMessage
	_ = json.Unmarshal(r.Data, &lista)
	if codigo != http.StatusOK || len(lista) != 1 {
		t.Fatalf("GetAll por valor_a_tomar: %d %s", codigo, r.Data)
	}

	// Sin valor_a_tomar se guarda NULL.
	sinValor := crear(t, ruta, fmt.Sprintf(`{"contrato_general_id":{"id":%d},"numero_cdp_id":5678}`, contrato))
	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("%s/%d", ruta, sinValor), "")
	if codigo != http.StatusOK || leer(r.Data) != nil {
		t.Fatalf("CDP sin valor_a_tomar: %d %s", codigo, r.Data)
	}

	esperar(t, http.MethodPost, ruta, fmt.Sprintf(`{"contrato_general_id":{"id":%d},"valor_a_tomar":"mucho"}`, contrato), http.StatusBadRequest)
}
