package controllers

import (
	"net/http"
	"testing"
)

func TestEstadoContratoController(t *testing.T) {
	probarCrud(t, "/v1/estados-contrato")
}

// Un estado de contrato para un contrato que no existe no deja nada a medias.
func TestEstadoContratoSinContrato(t *testing.T) {
	conectar(t)
	esperar(t, http.MethodPost, "/v1/estados-contrato", `{"contrato_general_id":{"id":999999},"usuario_id":1}`, http.StatusBadRequest)
}
