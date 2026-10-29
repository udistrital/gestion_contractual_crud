package controllers

import (
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
