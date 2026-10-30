package models

import (
	"errors"
	"testing"
	"time"

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

// Póliza y amparo: la fecha de inicio debe ser menor a la de fin, como en el
// CRUD en NestJS. Si falta una de las dos no se valida.
func TestFechasPolizaYAmparo(t *testing.T) {
	cg := &models.ContratoGeneral{Id: 1}
	ene := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	dic := time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC)
	casos := []struct {
		nombre      string
		inicio, fin time.Time
		valido      bool
	}{
		{"inicio menor a fin", ene, dic, true},
		{"inicio mayor a fin", dic, ene, false},
		{"fechas iguales", ene, ene, false},
		{"sin fecha de fin", dic, time.Time{}, true},
		{"sin fecha de inicio", time.Time{}, ene, true},
	}
	for _, c := range casos {
		poliza := &models.Poliza{ContratoGeneralId: cg, FechaInicio: c.inicio, FechaFin: c.fin}
		amparo := &models.AmparoPoliza{ContratoGeneralId: cg, AmparoId: 1, FechaInicio: c.inicio, FechaFin: c.fin}
		for _, modelo := range []interface{}{poliza, amparo} {
			if err := models.Validar(modelo); (err == nil) != c.valido {
				t.Fatalf("%s en %T: se esperaba válido=%v, llegó %v", c.nombre, modelo, c.valido, err)
			}
		}
	}
}
