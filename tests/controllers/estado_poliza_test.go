package controllers

import "testing"

func TestEstadoPolizaController(t *testing.T) {
	probarCrud(t, "/v1/estado_poliza")
}
