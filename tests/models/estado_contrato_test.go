package models

import (
	"fmt"
	"os"
	"testing"

	"github.com/beego/beego/v2/client/orm"
	_ "github.com/lib/pq"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// conectar registra la base de PostgreSQL de las pruebas. Solo corre con
// GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION=true y las variables
// GESTION_CONTRACTUAL_CRUD_PG* del README.
func conectar(t *testing.T) {
	t.Helper()
	if os.Getenv("GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION") != "true" {
		t.Skip("prueba de integración deshabilitada")
	}
	conn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?search_path=%s&sslmode=disable",
		os.Getenv("GESTION_CONTRACTUAL_CRUD_PGUSER"), os.Getenv("GESTION_CONTRACTUAL_CRUD_PGPASS"),
		os.Getenv("GESTION_CONTRACTUAL_CRUD_PGHOST"), os.Getenv("GESTION_CONTRACTUAL_CRUD_PGPORT"),
		os.Getenv("GESTION_CONTRACTUAL_CRUD_PGDB"), os.Getenv("GESTION_CONTRACTUAL_CRUD_PGSCHEMA"))
	if _, err := orm.GetDB("default"); err != nil {
		if err := orm.RegisterDataBase("default", "postgres", conn); err != nil {
			t.Fatal(err)
		}
	}
}

// AddEstadoContrato (generada por bee) inserta sin tocar la marca Actual de
// los demás estados; el API usa AddEstadoContratoActual.
func TestAddEstadoContratoDeBee(t *testing.T) {
	conectar(t)
	contrato, err := models.AddContratoGeneral(&models.ContratoGeneral{UnidadEjecutoraId: 1, Activo: true})
	if err != nil {
		t.Fatalf("AddContratoGeneral: %v", err)
	}
	id, err := models.AddEstadoContrato(&models.EstadoContrato{ContratoGeneralId: &models.ContratoGeneral{Id: int(contrato)}, UsuarioId: 1, Activo: true})
	if err != nil || id == 0 {
		t.Fatalf("AddEstadoContrato: %d %v", id, err)
	}
}
