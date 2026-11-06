package controllers

import "testing"

func TestDisponibilidadPresupuestalController(t *testing.T) {
	probarCrud(t, "/v1/disponibilidades-presupuestales")
}
