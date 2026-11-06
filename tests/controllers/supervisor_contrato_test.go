package controllers

import "testing"

func TestSupervisorContratoController(t *testing.T) {
	probarCrud(t, "/v1/supervisores")
}
