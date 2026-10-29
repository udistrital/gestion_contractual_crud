package controllers

import "testing"

func TestOrdenadorContratoController(t *testing.T) {
	probarCrud(t, "/v1/ordenador_contrato")
}
