package models

import (
	"context"
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
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
