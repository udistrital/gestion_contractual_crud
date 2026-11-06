package models

import (
	"reflect"
	"testing"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// numero_contrato es nulo hasta la suscripción: es puntero para que varios
// contratos sin número no choquen con UNIQUE (numero_contrato, vigencia_id).
func TestNumeroContratoAceptaNull(t *testing.T) {
	campo, _ := reflect.TypeOf(models.ContratoGeneral{}).FieldByName("NumeroContrato")
	if campo.Type.Kind() != reflect.Ptr {
		t.Fatal("NumeroContrato debe ser puntero")
	}
}

func TestContratoGeneralSegunModelo(t *testing.T) {
	tipo := reflect.TypeOf(models.ContratoGeneral{})
	for _, campo := range []string{"ProveedorNumeroDocumento", "TipoPersonaId", "ClaseProveedorId", "DependenciaSolicitanteId",
		"SedeSolicitanteId", "DependenciaSolicitanteLegadoId", "SedeSolicitanteLegadoId", "UsuarioLegado", "VigenciaId"} {
		if _, ok := tipo.FieldByName(campo); !ok {
			t.Fatalf("falta %s del modelo conceptual", campo)
		}
	}
	for _, retirado := range []string{"ContratistaId", "LugarEjecucionId", "SolicitanteId"} {
		if _, ok := tipo.FieldByName(retirado); ok {
			t.Fatalf("%s ya no hace parte del modelo", retirado)
		}
	}
}
