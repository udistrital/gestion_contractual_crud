package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

func TestDocumentoContratoController(t *testing.T) {
	probarCrud(t, "/v1/documentos-contratos")
}

// Reglas del documento polimórfico: la entidad debe existir y su tipo ser válido.
func TestDocumentoSegunEntidad(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contratos-generales", `{"unidad_ejecutora_id":1,"vigencia_id":2026}`)
	documento := crear(t, "/v1/documentos-contratos", fmt.Sprintf(`{"entidad_tipo":"contrato_general","entidad_id":%d}`, contrato))
	esperar(t, http.MethodPost, "/v1/documentos-contratos", `{"entidad_tipo":"poliza","entidad_id":999999}`, http.StatusBadRequest)
	esperar(t, http.MethodPut, fmt.Sprintf("/v1/documentos-contratos/%d", documento), `{"entidad_tipo":"contrato_general","entidad_id":999999}`, http.StatusBadRequest)
	esperar(t, http.MethodPut, fmt.Sprintf("/v1/documentos-contratos/%d", documento), `{"entidad_tipo":"contratista"}`, http.StatusBadRequest)
}

// Al borrar un contrato, una póliza o un acta de inicio también se desactivan sus
// documentos. Los documentos de otras entidades no cambian.
func TestDocumentosSeDesactivanConSuEntidad(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contratos-generales", `{"unidad_ejecutora_id":1,"vigencia_id":2026}`)
	cg := fmt.Sprintf(`{"contrato_general_id":{"id":%d}}`, contrato)
	entidades := map[string]int{
		"poliza":           crear(t, "/v1/polizas", cg),
		"acta_inicio":      crear(t, "/v1/actas-inicio", cg),
		"contrato_general": contrato,
	}
	activo := func(documento int) bool {
		t.Helper()
		codigo, r := solicitar(t, http.MethodGet, fmt.Sprintf("/v1/documentos-contratos/%d", documento), "")
		var d struct{ Activo bool }
		_ = json.Unmarshal(r.Data, &d)
		if codigo != http.StatusOK {
			t.Fatalf("documento %d: %d %s", documento, codigo, r.Data)
		}
		return d.Activo
	}
	documentos := map[string]int{}
	for tipo, id := range entidades {
		documentos[tipo] = crear(t, "/v1/documentos-contratos", fmt.Sprintf(`{"entidad_tipo":"%s","entidad_id":%d}`, tipo, id))
	}
	// El contrato se borra primero: borrarlo no toca los documentos de su póliza ni de su acta.
	borradas := map[string]bool{}
	rutas := map[string]string{"contrato_general": "contratos-generales", "poliza": "polizas", "acta_inicio": "actas-inicio"}
	for _, tipo := range []string{"contrato_general", "poliza", "acta_inicio"} {
		esperar(t, http.MethodDelete, fmt.Sprintf("/v1/%s/%d", rutas[tipo], entidades[tipo]), "", http.StatusOK)
		borradas[tipo] = true
		for otro, documento := range documentos {
			if activo(documento) == borradas[otro] {
				t.Fatalf("después de borrar %s, el documento de %s debía tener Activo = %v", tipo, otro, !borradas[otro])
			}
		}
	}
}
