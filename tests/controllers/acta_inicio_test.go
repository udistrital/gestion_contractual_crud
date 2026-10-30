package controllers

import "testing"

func TestActaInicioController(t *testing.T) {
	probarCrud(t, "/v1/acta_inicio")
}
