package controllers

import "testing"

func TestRegistroPresupuestalController(t *testing.T) {
	probarCrud(t, "/v1/registro_presupuestal")
}
