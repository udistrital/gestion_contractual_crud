package tests

import (
	"errors"
	"reflect"
	"testing"

	"github.com/udistrital/gestion_contractual_crud/models"
)

func errores(err error) []string {
	var v *models.ErrValidacion
	if errors.As(err, &v) {
		return v.Errores
	}
	return nil
}

func TestValidarObligatoriosYLongitud(t *testing.T) {
	largo := "123456789012345678901"
	e := errores(models.Validar(&models.ContratoGeneral{ProveedorNumeroDocumento: largo}))
	if len(e) != 2 {
		t.Fatalf("se esperaban 2 errores (UnidadEjecutoraId y longitud), llegaron %v", e)
	}
	if err := models.Validar(&models.ContratoGeneral{UnidadEjecutoraId: 1}); err != nil {
		t.Fatalf("no se esperaban errores: %v", err)
	}
	// Los bool NOT NULL (Actual) no son obligatorios en el cuerpo.
	if err := models.Validar(&models.EstadoContrato{ContratoGeneralId: &models.ContratoGeneral{Id: 1}, UsuarioId: 2}); err != nil {
		t.Fatalf("no se esperaban errores: %v", err)
	}
}

func TestRelacionesOpcionalesDelModelo(t *testing.T) {
	// El modelo conceptual permite amparos sin póliza y especificaciones sin contrato.
	if err := models.Validar(&models.AmparoPoliza{ContratoGeneralId: &models.ContratoGeneral{Id: 1}, AmparoId: 1}); err != nil {
		t.Fatalf("PolizaId es opcional: %v", err)
	}
	if err := models.Validar(&models.EspecificacionTecnica{Cantidad: 2}); err != nil {
		t.Fatalf("ContratoGeneralId es opcional en especificación técnica: %v", err)
	}
	if err := models.Validar(&models.RegistroPresupuestal{}); err == nil {
		t.Fatal("DisponibilidadPresupuestalId es obligatorio")
	}
}

func TestDocumentoPolimorfico(t *testing.T) {
	for _, entidad := range []string{"contrato_general", "poliza", "acta_inicio"} {
		if err := models.Validar(&models.DocumentoContrato{EntidadTipo: entidad, EntidadId: 1}); err != nil {
			t.Fatalf("%s debe ser válida: %v", entidad, err)
		}
	}
	if models.Validar(&models.DocumentoContrato{EntidadTipo: "contratista", EntidadId: 1}) == nil {
		t.Fatal("contratista no es una entidad del modelo")
	}
}

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
