package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

func TestDocumentoContratoController(t *testing.T) {
	probarCrud(t, "/v1/documento_contrato")
}

// Reglas del documento polimórfico: la entidad debe existir y su tipo ser válido.
func TestDocumentoSegunEntidad(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1}`)
	documento := crear(t, "/v1/documento_contrato", fmt.Sprintf(`{"EntidadTipo":"contrato_general","EntidadId":%d}`, contrato))
	esperar(t, http.MethodPost, "/v1/documento_contrato", `{"EntidadTipo":"poliza","EntidadId":999999}`, http.StatusBadRequest)
	esperar(t, http.MethodPut, fmt.Sprintf("/v1/documento_contrato/%d", documento), `{"EntidadTipo":"contrato_general","EntidadId":999999}`, http.StatusBadRequest)
	esperar(t, http.MethodPut, fmt.Sprintf("/v1/documento_contrato/%d", documento), `{"EntidadTipo":"contratista"}`, http.StatusBadRequest)
}

// Al borrar un contrato, una póliza o un acta de inicio también se desactivan sus
// documentos. Los documentos de otras entidades no cambian.
func TestDocumentosSeDesactivanConSuEntidad(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1}`)
	cg := fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d}}`, contrato)
	entidades := map[string]int{
		"poliza":           crear(t, "/v1/poliza", cg),
		"acta_inicio":      crear(t, "/v1/acta_inicio", cg),
		"contrato_general": contrato,
	}
	activo := func(documento int) bool {
		t.Helper()
		codigo, r := solicitar(t, http.MethodGet, fmt.Sprintf("/v1/documento_contrato/%d", documento), "")
		var d struct{ Activo bool }
		_ = json.Unmarshal(r.Data, &d)
		if codigo != http.StatusOK {
			t.Fatalf("documento %d: %d %s", documento, codigo, r.Data)
		}
		return d.Activo
	}
	documentos := map[string]int{}
	for tipo, id := range entidades {
		documentos[tipo] = crear(t, "/v1/documento_contrato", fmt.Sprintf(`{"EntidadTipo":"%s","EntidadId":%d}`, tipo, id))
	}
	// El contrato se borra primero: borrarlo no toca los documentos de su póliza ni de su acta.
	borradas := map[string]bool{}
	for _, tipo := range []string{"contrato_general", "poliza", "acta_inicio"} {
		esperar(t, http.MethodDelete, fmt.Sprintf("/v1/%s/%d", tipo, entidades[tipo]), "", http.StatusOK)
		borradas[tipo] = true
		for otro, documento := range documentos {
			if activo(documento) == borradas[otro] {
				t.Fatalf("después de borrar %s, el documento de %s debía tener Activo = %v", tipo, otro, !borradas[otro])
			}
		}
	}
}
