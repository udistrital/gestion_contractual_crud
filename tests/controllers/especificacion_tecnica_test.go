package controllers

import "testing"

func TestEspecificacionTecnicaController(t *testing.T) {
	probarCrud(t, "/v1/especificaciones-tecnicas")
}
