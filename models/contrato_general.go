package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type ContratoGeneral struct {
	Id                             int       `orm:"column(id);pk;auto"`
	NumeroContrato                 *string   `orm:"column(numero_contrato);size(50);null"`
	VigenciaId                     int       `orm:"column(vigencia_id);null"`
	ConsecutivoElaboracion         string    `orm:"column(consecutivo_elaboracion);size(50);null"`
	UnidadEjecutoraId              int       `orm:"column(unidad_ejecutora_id)"`
	TipoCompromisoId               int       `orm:"column(tipo_compromiso_id);null"`
	TipoContratoId                 int       `orm:"column(tipo_contrato_id);null"`
	PerfilContratistaId            int       `orm:"column(perfil_contratista_id);null"`
	FechaSuscripcionEstudio        time.Time `orm:"column(fecha_suscripcion_estudio);type(date);null"`
	AplicaPoliza                   bool      `orm:"column(aplica_poliza);null"`
	ModalidadSeleccionId           int       `orm:"column(modalidad_seleccion_id);null"`
	TipoControlId                  int       `orm:"column(tipo_control_id);null"`
	TipologiaEspecificaId          int       `orm:"column(tipologia_especifica_id);null"`
	RegimenContratacionId          int       `orm:"column(regimen_contratacion_id);null"`
	ProcedimientoId                int       `orm:"column(procedimiento_id);null"`
	PlazoEjecucion                 int       `orm:"column(plazo_ejecucion);null"`
	UnidadEjecucionId              int       `orm:"column(unidad_ejecucion_id);null"`
	TipoMonedaId                   int       `orm:"column(tipo_moneda_id);null"`
	ValorPesos                     float64   `orm:"column(valor_pesos);null"`
	ValorContratoMe                float64   `orm:"column(valor_contrato_me);null"`
	ValorTasaCambio                float64   `orm:"column(valor_tasa_cambio);null"`
	TipoGastoId                    int       `orm:"column(tipo_gasto_id);null"`
	OrigenRecursosId               int       `orm:"column(origen_recursos_id);null"`
	OrigenPresupuestoId            int       `orm:"column(origen_presupuesto_id);null"`
	TemaGastoInversionId           int       `orm:"column(tema_gasto_inversion_id);null"`
	MedioPagoId                    int       `orm:"column(medio_pago_id);null"`
	ClausulaRegistroPresupuestal   bool      `orm:"column(clausula_registro_presupuestal);null"`
	ModoPago                       string    `orm:"column(modo_pago);null;size(1000)"`
	Objeto                         string    `orm:"column(objeto);null;size(2000)"`
	Justificacion                  string    `orm:"column(justificacion);null;size(4000)"`
	Actividades                    string    `orm:"column(actividades);null;size(8000)"`
	Condiciones                    string    `orm:"column(condiciones);null;size(4000)"`
	Observaciones                  string    `orm:"column(observaciones);size(1000);null"`
	FechaInicial                   time.Time `orm:"column(fecha_inicial);type(date);null"`
	FechaFinal                     time.Time `orm:"column(fecha_final);type(date);null"`
	FechaSuscripcion               time.Time `orm:"column(fecha_suscripcion);type(date);null"`
	ProveedorNumeroDocumento       string    `orm:"column(proveedor_numero_documento);size(20);null"`
	TipoPersonaId                  int       `orm:"column(tipo_persona_id);null"`
	ClaseProveedorId               int       `orm:"column(clase_proveedor_id);null"`
	DependenciaSolicitanteId       int       `orm:"column(dependencia_solicitante_id);null"`
	SedeSolicitanteId              int       `orm:"column(sede_solicitante_id);null"`
	DependenciaSolicitanteLegadoId int       `orm:"column(dependencia_solicitante_legado_id);null"`
	SedeSolicitanteLegadoId        int       `orm:"column(sede_solicitante_legado_id);null"`
	UsuarioId                      int       `orm:"column(usuario_id);null"`
	UsuarioRol                     string    `orm:"column(usuario_rol);size(40);null"`
	UsuarioLegado                  string    `orm:"column(usuario_legado);size(15);null"`
	Activo                         bool      `orm:"column(activo)"`
	FechaCreacion                  time.Time `orm:"column(fecha_creacion);type(timestamp without time zone);auto_now_add"`
	FechaModificacion              time.Time `orm:"column(fecha_modificacion);type(timestamp without time zone);auto_now"`
}

func (t *ContratoGeneral) TableName() string {
	return "contrato_general"
}

func init() {
	orm.RegisterModel(new(ContratoGeneral))
}

// AddContratoGeneral insert a new ContratoGeneral into database and returns
// last inserted Id on success.
func AddContratoGeneral(m *ContratoGeneral) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetContratoGeneralById retrieves ContratoGeneral by Id. Returns error if
// Id doesn't exist
func GetContratoGeneralById(id int) (v *ContratoGeneral, err error) {
	o := orm.NewOrm()
	v = &ContratoGeneral{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllContratoGeneral retrieves all ContratoGeneral matches certain condition. Returns empty list if
// no records exist
func GetAllContratoGeneral(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(ContratoGeneral)).RelatedSel()
	// query k=v
	for k, v := range query {
		// rewrite dot-notation to Object__Attribute
		k = strings.Replace(k, ".", "__", -1)
		if strings.Contains(k, "isnull") {
			qs = qs.Filter(k, (v == "true" || v == "1"))
		} else {
			qs = qs.Filter(k, v)
		}
	}
	// order by:
	var sortFields []string
	if len(sortby) != 0 {
		if len(sortby) == len(order) {
			// 1) for each sort field, there is an associated order
			for i, v := range sortby {
				orderby := ""
				if order[i] == "desc" {
					orderby = "-" + v
				} else if order[i] == "asc" {
					orderby = v
				} else {
					return nil, errors.New("Error: Invalid order. Must be either [asc|desc]")
				}
				sortFields = append(sortFields, orderby)
			}
			qs = qs.OrderBy(sortFields...)
		} else if len(sortby) != len(order) && len(order) == 1 {
			// 2) there is exactly one order, all the sorted fields will be sorted by this order
			for _, v := range sortby {
				orderby := ""
				if order[0] == "desc" {
					orderby = "-" + v
				} else if order[0] == "asc" {
					orderby = v
				} else {
					return nil, errors.New("Error: Invalid order. Must be either [asc|desc]")
				}
				sortFields = append(sortFields, orderby)
			}
		} else if len(sortby) != len(order) && len(order) != 1 {
			return nil, errors.New("Error: 'sortby', 'order' sizes mismatch or 'order' size is not 1")
		}
	} else {
		if len(order) != 0 {
			return nil, errors.New("Error: unused 'order' fields")
		}
	}

	var l []ContratoGeneral
	qs = qs.OrderBy(sortFields...)
	if _, err = qs.Limit(limit, offset).All(&l, fields...); err == nil {
		if len(fields) == 0 {
			for _, v := range l {
				ml = append(ml, v)
			}
		} else {
			// trim unused fields
			for _, v := range l {
				m := make(map[string]interface{})
				val := reflect.ValueOf(v)
				for _, fname := range fields {
					m[fname] = val.FieldByName(fname).Interface()
				}
				ml = append(ml, m)
			}
		}
		return ml, nil
	}
	return nil, err
}

// UpdateContratoGeneral updates ContratoGeneral by Id and returns error if
// the record to be updated doesn't exist
func UpdateContratoGeneralById(m *ContratoGeneral) (err error) {
	o := orm.NewOrm()
	v := ContratoGeneral{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteContratoGeneral desactiva el registro (borrado lógico: activo = false) y
// returns error if the record to be deleted doesn't exist
func DeleteContratoGeneral(id int) (err error) {
	o := orm.NewOrm()
	v := ContratoGeneral{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		v.Activo = false
		if num, err = o.Update(&v, "Activo", "FechaModificacion"); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}
