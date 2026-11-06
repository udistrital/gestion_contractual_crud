package main

import (
	"os"

	"github.com/beego/beego/v2/client/orm/migration"
)

// DO NOT MODIFY
type CrearTablasContratacion_20261028_171822 struct {
	migration.Migration
}

// DO NOT MODIFY
func init() {
	m := &CrearTablasContratacion_20261028_171822{}
	m.Created = "20261028_171822"

	migration.Register("CrearTablasContratacion_20261028_171822", m)
}

// Run the migrations
func (m *CrearTablasContratacion_20261028_171822) Up() {
	// use m.SQL("CREATE TABLE ...") to make schema update
	// bee migrate ejecuta esta migración desde database/migrations. El DDL va completo en un solo
	// m.SQL: partirlo por ";" (como sugiere beego_migrations.md) rompe los COMMENT ON cuyo texto
	// lleva ";". Así hay una sola copia del DDL, la misma que usan los DBA y el docker-compose.
	ddl, err := os.ReadFile("../gestion_contractual.sql")
	if err != nil {
		panic("no se pudo leer database/gestion_contractual.sql: " + err.Error())
	}
	m.SQL(string(ddl))
}

// Reverse the migrations
func (m *CrearTablasContratacion_20261028_171822) Down() {
	// use m.SQL("DROP TABLE ...") to reverse schema update
	// Hijos antes que padres. No borra el esquema: allí queda la tabla migrations de bee.
	m.SQL(`DROP TABLE IF EXISTS documento_contrato, acta_inicio, amparo_poliza, estado_poliza, poliza,
		registro_presupuestal, disponibilidad_presupuestal, especificacion_tecnica, convenio,
		contrato_arrendamiento, ordenador_contrato, supervisor_contrato, estado_contrato, contrato_general`)
}
