package models

import (
	"context"
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/beego/beego/v2/client/orm"
)

// ErrValidacion agrupa los errores de validación de un registro.
type ErrValidacion struct {
	Errores []string
}

func (e *ErrValidacion) Error() string { return strings.Join(e.Errores, "; ") }

// ErrNoEncontrado indica que un registro relacionado no existe.
var ErrNoEncontrado = errors.New("registro relacionado no encontrado")

// Entidades a las que puede pertenecer un documento_contrato (relación
// polimórfica: entidad_tipo + entidad_id, sin llave foránea).
var EntidadesDocumento = map[string]func(id int) interface{}{
	"contrato_general": func(id int) interface{} { return &ContratoGeneral{Id: id} },
	"poliza":           func(id int) interface{} { return &Poliza{Id: id} },
	"acta_inicio":      func(id int) interface{} { return &ActaInicio{Id: id} },
}

// Validar revisa las reglas que se leen de las etiquetas orm del modelo:
// columnas NOT NULL obligatorias y longitud máxima (size) de los textos.
func Validar(modelo interface{}) error {
	v := reflect.ValueOf(modelo)
	for v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	t := v.Type()
	var errores []string
	for i := 0; i < t.NumField(); i++ {
		tag := t.Field(i).Tag.Get("orm")
		if tag == "" || tag == "-" || strings.Contains(tag, "pk") || strings.Contains(tag, "auto_now") {
			continue
		}
		nombre := t.Field(i).Name
		campo := v.Field(i)
		if !strings.Contains(tag, ";null") && campo.Kind() != reflect.Bool && vacio(campo) {
			errores = append(errores, nombre+" es obligatorio")
			continue
		}
		if inicio := strings.Index(tag, "size("); inicio >= 0 {
			fin := strings.Index(tag[inicio:], ")")
			maximo, _ := strconv.Atoi(tag[inicio+5 : inicio+fin])
			texto := campo
			if texto.Kind() == reflect.Ptr && !texto.IsNil() {
				texto = texto.Elem()
			}
			if texto.Kind() == reflect.String && utf8.RuneCountInString(texto.String()) > maximo {
				errores = append(errores, fmt.Sprintf("%s admite máximo %d caracteres", nombre, maximo))
			}
		}
	}
	if d, ok := modelo.(*DocumentoContrato); ok {
		if _, ok := EntidadesDocumento[d.EntidadTipo]; !ok && d.EntidadTipo != "" {
			errores = append(errores, "EntidadTipo debe ser contrato_general, poliza o acta_inicio")
		}
	}
	if p, ok := modelo.(*Poliza); ok {
		errores = append(errores, validarFechas(p.FechaInicio, p.FechaFin)...)
	}
	if a, ok := modelo.(*AmparoPoliza); ok {
		errores = append(errores, validarFechas(a.FechaInicio, a.FechaFin)...)
	}
	if len(errores) > 0 {
		return &ErrValidacion{Errores: errores}
	}
	return nil
}

// vacio indica si el campo obligatorio no trae valor. Para una relación
// (puntero a struct) revisa que tenga Id.
func vacio(campo reflect.Value) bool {
	if campo.Kind() == reflect.Ptr {
		if campo.IsNil() {
			return true
		}
		if campo.Elem().Kind() == reflect.Struct {
			id := campo.Elem().FieldByName("Id")
			return id.IsValid() && id.IsZero()
		}
		return false
	}
	return campo.IsZero()
}

// validarFechas revisa que la fecha de inicio sea menor a la de fin (póliza y
// amparo), como el CRUD en NestJS: si falta una de las dos no se valida.
func validarFechas(inicio, fin time.Time) []string {
	if inicio.IsZero() || fin.IsZero() || inicio.Before(fin) {
		return nil
	}
	return []string{"La fecha de inicio debe ser menor a la fecha de fin"}
}

// ValidarEntidadDocumento revisa que exista el registro al que pertenece el
// documento, porque documento_contrato no tiene llave foránea.
func ValidarEntidadDocumento(d *DocumentoContrato) error {
	if err := orm.NewOrm().Read(EntidadesDocumento[d.EntidadTipo](d.EntidadId)); err != nil {
		if errors.Is(err, orm.ErrNoRows) {
			return fmt.Errorf("%w: %s con Id %d", ErrNoEncontrado, d.EntidadTipo, d.EntidadId)
		}
		return err
	}
	return nil
}

// AddEstadoContratoActual registra el nuevo estado como actual y le quita esa
// marca al estado actual anterior del contrato, en una sola transacción.
func AddEstadoContratoActual(m *EstadoContrato) (id int64, err error) {
	err = orm.NewOrm().DoTx(func(_ context.Context, txOrm orm.TxOrmer) error {
		if _, err := txOrm.QueryTable(new(EstadoContrato)).
			Filter("ContratoGeneralId", m.ContratoGeneralId.Id).Filter("Actual", true).
			Update(orm.Params{"actual": false}); err != nil {
			return err
		}
		m.Actual = true
		var err error
		id, err = txOrm.Insert(m)
		return err
	})
	return
}

// ContarRegistros cuenta los registros que cumplen el query del GetAll, sin
// limit ni offset, para el Metadata.total (el CRUD en NestJS usaba getManyAndCount).
// Aplica los filtros igual que los GetAll generados por bee.
func ContarRegistros(modelo interface{}, query map[string]string) (int64, error) {
	qs := orm.NewOrm().QueryTable(modelo)
	for k, v := range query {
		k = strings.Replace(k, ".", "__", -1)
		if strings.Contains(k, "isnull") {
			qs = qs.Filter(k, (v == "true" || v == "1"))
		} else {
			qs = qs.Filter(k, v)
		}
	}
	return qs.Count()
}

// desactivarDocumentos hace el borrado lógico de los documentos de una entidad
// (contrato_general, poliza o acta_inicio) dentro de la transacción del DELETE
// de esa entidad. QuerySeter.Update no aplica auto_now: la fecha va explícita.
func desactivarDocumentos(txOrm orm.TxOrmer, entidadTipo string, entidadId int) error {
	_, err := txOrm.QueryTable(new(DocumentoContrato)).
		Filter("EntidadTipo", entidadTipo).Filter("EntidadId", entidadId).
		Update(orm.Params{"activo": false, "fecha_modificacion": time.Now()})
	return err
}

// ConteoConsecutivo es el cuerpo de POST /contrato_general/conteo-consecutivo,
// con los mismos campos del CRUD en NestJS.
type ConteoConsecutivo struct {
	UnidadEjecutoraId int `json:"unidad_ejecutora_id"`
}

// ConteoNumeroContrato es el cuerpo de POST /contrato_general/conteo-numero-contrato.
// Vigencia es el Id del parámetro de vigencia (contrato_general.vigencia_id) y
// Estado el estado_parametro_id de estado_contrato.
type ConteoNumeroContrato struct {
	UnidadEjecutoraId int `json:"unidad_ejecutora_id"`
	Vigencia          int `json:"vigencia"`
	Estado            int `json:"estado"`
}

// ContarConsecutivo cuenta los contratos de una unidad ejecutora, activos e
// inactivos. El MID le suma 1 para el consecutivo.
func ContarConsecutivo(c ConteoConsecutivo) (int64, error) {
	if c.UnidadEjecutoraId == 0 {
		return 0, &ErrValidacion{Errores: []string{"unidad_ejecutora_id es obligatorio"}}
	}
	return orm.NewOrm().QueryTable(new(ContratoGeneral)).Filter("UnidadEjecutoraId", c.UnidadEjecutoraId).Count()
}

// ContarNumeroContrato cuenta los contratos de una unidad y una vigencia que
// tienen o tuvieron el estado indicado (cualquier registro de estado_contrato,
// no solo el actual), activos e inactivos. El MID arma prefijo + (conteo + 1) + sufijo.
func ContarNumeroContrato(c ConteoNumeroContrato) (total int64, err error) {
	var errores []string
	if c.UnidadEjecutoraId == 0 {
		errores = append(errores, "unidad_ejecutora_id es obligatorio")
	}
	if c.Vigencia == 0 {
		errores = append(errores, "vigencia es obligatorio")
	}
	if c.Estado == 0 {
		errores = append(errores, "estado es obligatorio")
	}
	if len(errores) > 0 {
		return 0, &ErrValidacion{Errores: errores}
	}
	err = orm.NewOrm().Raw(`SELECT COUNT(DISTINCT cg.id) FROM contrato_general cg
		INNER JOIN estado_contrato ec ON ec.contrato_general_id = cg.id
		WHERE cg.unidad_ejecutora_id = ? AND cg.vigencia_id = ? AND ec.estado_parametro_id = ?`,
		c.UnidadEjecutoraId, c.Vigencia, c.Estado).QueryRow(&total)
	return
}
