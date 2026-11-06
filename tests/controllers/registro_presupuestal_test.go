package controllers

import "testing"

func TestRegistroPresupuestalController(t *testing.T) {
	probarCrud(t, "/v1/registros-presupuestales")
}
