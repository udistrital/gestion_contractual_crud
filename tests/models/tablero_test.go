package models

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/beego/beego/v2/client/orm"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// Pruebas unitarias (sin base de datos) del armado de las consultas del tablero.

func TestConsultaTableroSinFiltros(t *testing.T) {
	sql, args := models.ConsultaContratosTablero(models.FiltroTablero{})
	if len(args) != 0 || strings.Count(sql, "?") != 0 {
		t.Fatalf("sin filtros no debe haber argumentos: %d %v", strings.Count(sql, "?"), args)
	}
	for _, texto := range []string{"cg.activo = true", "ec.activo = true", "LIKE 'ABOGADO%'", "ORDER BY c.id"} {
		if !strings.Contains(sql, texto) {
			t.Fatalf("la consulta no contiene %q", texto)
		}
	}
	if strings.Contains(sql, "/*condiciones*/") || strings.Contains(sql, "WHERE ab.usuario_id") {
		t.Fatal("la marca de condiciones o el filtro de abogado quedaron en la consulta")
	}
}

func TestConsultaTableroConFiltros(t *testing.T) {
	f := models.FiltroTablero{VigenciaId: 7, AbogadoId: 500, DependenciaSolicitanteIds: []int{31, 45, 60}}
	sql, args := models.ConsultaContratosTablero(f)
	if strings.Count(sql, "?") != len(args) {
		t.Fatalf("%d marcas y %d argumentos", strings.Count(sql, "?"), len(args))
	}
	// Los argumentos van en el orden en que aparecen las marcas.
	esperados := []interface{}{7, 31, 45, 60, 500}
	if fmt.Sprint(args) != fmt.Sprint(esperados) {
		t.Fatalf("argumentos %v, se esperaban %v", args, esperados)
	}
	for _, texto := range []string{"cg.vigencia_id = ?", "cg.dependencia_solicitante_id IN (?,?,?)", "WHERE ab.usuario_id = ?"} {
		if !strings.Contains(sql, texto) {
			t.Fatalf("la consulta no contiene %q", texto)
		}
	}
	// Ningún valor del filtro se concatena al SQL.
	for _, valor := range []string{"500", "31", "45", "60"} {
		if strings.Contains(sql, valor) {
			t.Fatalf("el valor %s quedó en el texto SQL", valor)
		}
	}
}

// Pruebas de integración contra PostgreSQL con database/gestion_contractual.sql.

const (
	porSuscribir = 6773
	suscrito     = 6774
	declinado    = 6775
	legalizado   = 6776
)

type datosTablero struct {
	vigencia, dep1, dep2               int
	regreso, sinActual, sinEstados, c2 int
}

func insertarContrato(t *testing.T, o orm.Ormer, vigencia, dependencia int, activo bool) int {
	t.Helper()
	var id int
	if err := o.Raw(`INSERT INTO contrato_general (unidad_ejecutora_id, vigencia_id, dependencia_solicitante_id, sede_solicitante_id, fecha_final, activo)
		VALUES (1, ?, ?, 2, '2026-12-31', ?) RETURNING id`, vigencia, dependencia, activo).QueryRow(&id); err != nil {
		t.Fatal(err)
	}
	return id
}

func insertarEstado(t *testing.T, o orm.Ormer, contrato, estado int, actual bool, usuario int, rol string, fecha time.Time, activo bool) {
	t.Helper()
	if _, err := o.Raw(`INSERT INTO estado_contrato (contrato_general_id, estado_parametro_id, actual, usuario_id, usuario_rol, activo, fecha_creacion)
		VALUES (?, ?, ?, ?, ?, ?, ?)`, contrato, estado, actual, usuario, rol, activo, fecha).Exec(); err != nil {
		t.Fatal(err)
	}
}

// sembrarTablero crea los contratos de una vigencia propia de la prueba, para no
// depender de los datos de otras pruebas.
func sembrarTablero(t *testing.T) datosTablero {
	t.Helper()
	o := orm.NewOrm()
	base := int(time.Now().UnixNano()%1000000) + 1000000
	d := datosTablero{vigencia: base, dep1: base + 1, dep2: base + 2}
	dia := func(n int) time.Time { return time.Date(2026, 10, n, 9, 0, 0, 0, time.UTC) }

	// Regresa a Por suscribir después de Suscrito: la fecha del estado es la del regreso.
	d.regreso = insertarContrato(t, o, d.vigencia, d.dep1, true)
	insertarEstado(t, o, d.regreso, porSuscribir, false, 500, "ABOGADO_CONTRATACION_RECTOR", dia(1), true)
	insertarEstado(t, o, d.regreso, porSuscribir, false, 900, "JEFE_CONTRATACION_RECTOR", dia(2), true)
	insertarEstado(t, o, d.regreso, suscrito, false, 900, "JEFE_CONTRATACION_RECTOR", dia(3), true)
	insertarEstado(t, o, d.regreso, porSuscribir, true, 900, "JEFE_CONTRATACION_RECTOR", dia(4), true)

	// Dos registros seguidos con el mismo estado: la fecha es la del primero.
	d.c2 = insertarContrato(t, o, d.vigencia, d.dep2, true)
	insertarEstado(t, o, d.c2, porSuscribir, false, 600, "ABOGADO_CONTRATACION_IDEXUD", dia(5), true)
	insertarEstado(t, o, d.c2, porSuscribir, true, 900, "JEFE_CONTRATACION_IDEXUD", dia(6), true)

	// Sin estados.
	d.sinEstados = insertarContrato(t, o, d.vigencia, d.dep1, true)

	// Ninguno marcado como actual: es el más reciente; el estado desactivado no cuenta.
	d.sinActual = insertarContrato(t, o, d.vigencia, d.dep2, true)
	insertarEstado(t, o, d.sinActual, suscrito, false, 1, "ABOGADO", dia(7), true)
	insertarEstado(t, o, d.sinActual, legalizado, false, 900, "JEFE_CONTRATACION_RECTOR", dia(8), true)
	insertarEstado(t, o, d.sinActual, declinado, false, 900, "JEFE_CONTRATACION_RECTOR", dia(9), false)

	// Inactivo y de otra vigencia: no aparecen.
	inactivo := insertarContrato(t, o, d.vigencia, d.dep1, false)
	insertarEstado(t, o, inactivo, porSuscribir, true, 500, "ABOGADO_CONTRATACION_RECTOR", dia(1), true)
	otra := insertarContrato(t, o, d.vigencia+3, d.dep1, true)
	insertarEstado(t, o, otra, porSuscribir, true, 500, "ABOGADO_CONTRATACION_RECTOR", dia(1), true)
	return d
}

func ids(l []models.ContratoTablero) []int {
	var r []int
	for _, c := range l {
		r = append(r, c.ContratoGeneralId)
	}
	return r
}

func TestContratosTableroIntegracion(t *testing.T) {
	conectar(t)
	d := sembrarTablero(t)

	l, err := models.GetContratosTablero(models.FiltroTablero{VigenciaId: d.vigencia})
	if err != nil {
		t.Fatal(err)
	}
	if fmt.Sprint(ids(l)) != fmt.Sprint([]int{d.regreso, d.c2, d.sinEstados, d.sinActual}) {
		t.Fatalf("contratos de la vigencia: %v", ids(l))
	}
	porId := map[int]models.ContratoTablero{}
	for _, c := range l {
		porId[c.ContratoGeneralId] = c
	}

	r := porId[d.regreso]
	if *r.EstadoParametroId != porSuscribir || r.FechaEstado.Day() != 4 || *r.AbogadoId != 500 ||
		*r.VigenciaId != d.vigencia || *r.DependenciaSolicitanteId != d.dep1 || *r.SedeSolicitanteId != 2 ||
		r.FechaFinal.Format("2006-01-02") != "2026-12-31" {
		t.Fatalf("regreso a un estado anterior: %+v", r)
	}
	if c := porId[d.c2]; *c.EstadoParametroId != porSuscribir || c.FechaEstado.Day() != 5 || *c.AbogadoId != 600 {
		t.Fatalf("tramo con dos registros del mismo estado: %+v", c)
	}
	if c := porId[d.sinEstados]; c.EstadoParametroId != nil || c.FechaEstado != nil || c.AbogadoId != nil {
		t.Fatalf("contrato sin estados: %+v", c)
	}
	// usuario_id 1 se devuelve tal cual (el consumidor lo trata como sin identificar).
	if c := porId[d.sinActual]; *c.EstadoParametroId != legalizado || c.FechaEstado.Day() != 8 || *c.AbogadoId != 1 {
		t.Fatalf("sin estado marcado como actual: %+v", c)
	}

	// Filtros por abogado y por una o varias dependencias.
	if l, _ := models.GetContratosTablero(models.FiltroTablero{VigenciaId: d.vigencia, AbogadoId: 500}); fmt.Sprint(ids(l)) != fmt.Sprint([]int{d.regreso}) {
		t.Fatalf("filtro por abogado: %v", ids(l))
	}
	if l, _ := models.GetContratosTablero(models.FiltroTablero{VigenciaId: d.vigencia, DependenciaSolicitanteIds: []int{d.dep2}}); fmt.Sprint(ids(l)) != fmt.Sprint([]int{d.c2, d.sinActual}) {
		t.Fatalf("filtro por una dependencia: %v", ids(l))
	}
	if l, _ := models.GetContratosTablero(models.FiltroTablero{VigenciaId: d.vigencia, DependenciaSolicitanteIds: []int{d.dep1, d.dep2}}); len(l) != 4 {
		t.Fatalf("filtro por varias dependencias: %v", ids(l))
	}

	// Sin resultados: lista vacía, no nula.
	l, err = models.GetContratosTablero(models.FiltroTablero{VigenciaId: d.vigencia + 99})
	if err != nil || l == nil || len(l) != 0 {
		t.Fatalf("sin resultados: %v %v", l, err)
	}
}
