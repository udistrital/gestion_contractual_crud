package controllers

import "testing"

func TestConvenioController(t *testing.T) {
	probarCrud(t, "/v1/convenio")
}
