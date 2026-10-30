package controllers

import (
	"net/http"
	"testing"
)

func TestEstadoContratoController(t *testing.T) {
	probarCrud(t, "/v1/estado_contrato")
}

// Un estado de contrato para un contrato que no existe no deja nada a medias.
func TestEstadoContratoSinContrato(t *testing.T) {
	conectar(t)
	esperar(t, http.MethodPost, "/v1/estado_contrato", `{"ContratoGeneralId":{"Id":999999},"UsuarioId":1}`, http.StatusBadRequest)
}
