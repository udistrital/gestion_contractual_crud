package models

import (
	"strings"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

// FiltroTablero son los filtros opcionales de /v1/tableros/contratos. Un valor
// 0 o una lista vacía no filtra.
type FiltroTablero struct {
	VigenciaId                int
	AbogadoId                 int
	DependenciaSolicitanteIds []int
}

// ContratoTablero es la fila de seguimiento de un contrato activo. Solo trae
// Ids: los nombres (estado, dependencia, sede, abogado) los resuelve quien
// consume el servicio (Parámetros, OIKOS y Terceros).
type ContratoTablero struct {
	ContratoGeneralId        int        `orm:"column(contrato_general_id)" json:"contrato_general_id"`
	NumeroContrato           *string    `orm:"column(numero_contrato)" json:"numero_contrato"`
	ConsecutivoElaboracion   *string    `orm:"column(consecutivo_elaboracion)" json:"consecutivo_elaboracion"`
	VigenciaId               *int       `orm:"column(vigencia_id)" json:"vigencia_id"`
	FechaFinal               *time.Time `orm:"column(fecha_final)" json:"fecha_final"`
	DependenciaSolicitanteId *int       `orm:"column(dependencia_solicitante_id)" json:"dependencia_solicitante_id"`
	// Estado general actual (estado_contrato.estado_parametro_id).
	EstadoParametroId *int `orm:"column(estado_parametro_id)" json:"estado_parametro_id"`
	// Inicio del último tramo continuo con el estado general actual.
	FechaEstado *time.Time `orm:"column(fecha_estado)" json:"fecha_estado"`
	// usuario_id del primer estado registrado con rol ABOGADO*. Puede ser 1
	// cuando el registro no obtuvo el persona_id: quien consume lo trata como
	// "sin identificar".
	AbogadoId *int `orm:"column(abogado_id)" json:"abogado_id"`
}

// consultaEstadosTablero calcula, solo para los contratos que cumplen el
// filtro (marca condicionesTablero), el estado general actual (el marcado como
// actual o, si ninguno lo está, el más reciente), el inicio de su último tramo
// (el último cambio de estado general hasta el actual, que contempla el regreso
// a un estado anterior) y el abogado (el primer estado con rol ABOGADO*).
// Todo con funciones de ventana, sin subconsultas por fila. El QuerySeter del
// ORM no expresa ROW_NUMBER, LAG ni DISTINCT ON, por eso se usa orm.Raw. El
// texto es fijo: los valores van como argumentos (?).
const consultaEstadosTablero = `WITH contratos AS (
	SELECT cg.id, cg.numero_contrato, cg.consecutivo_elaboracion, cg.vigencia_id, cg.fecha_final,
		cg.dependencia_solicitante_id
	FROM contrato_general cg
	WHERE cg.activo = true/*condiciones*/
), estados AS (
	SELECT ec.contrato_general_id, ec.estado_parametro_id, ec.actual, ec.usuario_id, ec.usuario_rol, ec.fecha_creacion,
		ROW_NUMBER() OVER w AS orden,
		(ROW_NUMBER() OVER w = 1 OR LAG(ec.estado_parametro_id) OVER w IS DISTINCT FROM ec.estado_parametro_id) AS cambio
	FROM estado_contrato ec
	INNER JOIN contratos c ON c.id = ec.contrato_general_id
	WHERE ec.activo = true
	WINDOW w AS (PARTITION BY ec.contrato_general_id ORDER BY ec.fecha_creacion, ec.id)
), actual AS (
	SELECT DISTINCT ON (contrato_general_id) contrato_general_id, estado_parametro_id, orden
	FROM estados
	ORDER BY contrato_general_id, actual DESC, orden DESC
), inicio AS (
	SELECT DISTINCT ON (e.contrato_general_id) e.contrato_general_id, e.fecha_creacion AS fecha_estado
	FROM estados e
	INNER JOIN actual a ON a.contrato_general_id = e.contrato_general_id AND e.orden <= a.orden
	WHERE e.cambio
	ORDER BY e.contrato_general_id, e.orden DESC
), abogado AS (
	SELECT DISTINCT ON (contrato_general_id) contrato_general_id, usuario_id
	FROM estados
	WHERE UPPER(usuario_rol) LIKE 'ABOGADO%'
	ORDER BY contrato_general_id, orden
)
`

// condicionesTablero marca dónde van los filtros de contrato_general.
const condicionesTablero = "/*condiciones*/"

const desdeTablero = `FROM contratos c
LEFT JOIN actual a ON a.contrato_general_id = c.id
LEFT JOIN inicio i ON i.contrato_general_id = c.id
LEFT JOIN abogado ab ON ab.contrato_general_id = c.id
`

const seleccionContratosTablero = `SELECT c.id AS contrato_general_id, c.numero_contrato, c.consecutivo_elaboracion, c.vigencia_id,
	c.fecha_final, c.dependencia_solicitante_id, a.estado_parametro_id,
	i.fecha_estado, ab.usuario_id AS abogado_id
`

// ConsultaContratosTablero arma la consulta de /v1/tableros/contratos con los
// filtros. Las condiciones son fragmentos fijos con "?" y los valores van en
// args, en el mismo orden; ningún valor del usuario se concatena al SQL.
func ConsultaContratosTablero(f FiltroTablero) (string, []interface{}) {
	var condiciones []string
	var args []interface{}
	if f.VigenciaId > 0 {
		condiciones = append(condiciones, " AND cg.vigencia_id = ?")
		args = append(args, f.VigenciaId)
	}
	if len(f.DependenciaSolicitanteIds) > 0 {
		marcas := strings.TrimSuffix(strings.Repeat("?,", len(f.DependenciaSolicitanteIds)), ",")
		condiciones = append(condiciones, " AND cg.dependencia_solicitante_id IN ("+marcas+")")
		for _, id := range f.DependenciaSolicitanteIds {
			args = append(args, id)
		}
	}
	consulta := strings.Replace(consultaEstadosTablero, condicionesTablero, strings.Join(condiciones, ""), 1) +
		seleccionContratosTablero + desdeTablero
	if f.AbogadoId > 0 {
		consulta += "WHERE ab.usuario_id = ?\n"
		args = append(args, f.AbogadoId)
	}
	return consulta + "ORDER BY c.id\n", args
}

// GetContratosTablero trae los metadatos de seguimiento de los contratos
// activos que cumplen el filtro. Sin resultados devuelve una lista vacía.
func GetContratosTablero(f FiltroTablero) ([]ContratoTablero, error) {
	sql, args := ConsultaContratosTablero(f)
	l := []ContratoTablero{}
	if _, err := orm.NewOrm().Raw(sql, args...).QueryRows(&l); err != nil {
		return nil, err
	}
	return l, nil
}
