package controllers

import "testing"

func TestAmparoPolizaController(t *testing.T) {
	probarCrud(t, "/v1/amparo_poliza")
}
