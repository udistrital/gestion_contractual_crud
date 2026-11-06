package controllers

import "testing"

func TestPolizaController(t *testing.T) {
	probarCrud(t, "/v1/polizas")
}
