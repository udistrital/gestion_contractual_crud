package controllers

import "testing"

func TestContratoArrendamientoController(t *testing.T) {
	probarCrud(t, "/v1/contrato_arrendamiento")
}
