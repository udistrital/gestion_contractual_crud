package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type ActaInicio struct {
	Id                         int              `orm:"column(id);pk;auto"`
	ContratoGeneralId          *ContratoGeneral `orm:"column(contrato_general_id);rel(fk)"`
	Descripcion                string           `orm:"column(descripcion);null;size(2000)"`
	FechaInicio                time.Time        `orm:"column(fecha_inicio);type(date);null"`
	FechaFin                   time.Time        `orm:"column(fecha_fin);type(date);null"`
	FechaSuscripcion           time.Time        `orm:"column(fecha_suscripcion);type(date);null"`
	NumeroActa                 string           `orm:"column(numero_acta);size(50);null"`
	ValorDisponibilidad        float64          `orm:"column(valor_disponibilidad);null"`
	NumeroRegistroPresupuestal string           `orm:"column(numero_registro_presupuestal);size(50);null"`
	ValorRegistroPresupuestal  float64          `orm:"column(valor_registro_presupuestal);null"`
	ValorAnticipo              float64          `orm:"column(valor_anticipo);null"`
	NombreInterventor          string           `orm:"column(nombre_interventor);size(250);null"`
	UsuarioId                  int              `orm:"column(usuario_id);null"`
	UsuarioRol                 string           `orm:"column(usuario_rol);size(40);null"`
	UsuarioLegado              string           `orm:"column(usuario_legado);size(15);null"`
	Activo                     bool             `orm:"column(activo)"`
	FechaCreacion              time.Time        `orm:"column(fecha_creacion);type(timestamp without time zone);auto_now_add"`
	FechaModificacion          time.Time        `orm:"column(fecha_modificacion);type(timestamp without time zone);auto_now"`
}

func (t *ActaInicio) TableName() string {
	return "acta_inicio"
}

func init() {
	orm.RegisterModel(new(ActaInicio))
}

// AddActaInicio insert a new ActaInicio into database and returns
// last inserted Id on success.
func AddActaInicio(m *ActaInicio) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetActaInicioById retrieves ActaInicio by Id. Returns error if
// Id doesn't exist
func GetActaInicioById(id int) (v *ActaInicio, err error) {
	o := orm.NewOrm()
	v = &ActaInicio{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllActaInicio retrieves all ActaInicio matches certain condition. Returns empty list if
// no records exist
func GetAllActaInicio(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(ActaInicio)).RelatedSel()
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

	var l []ActaInicio
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

// UpdateActaInicio updates ActaInicio by Id and returns error if
// the record to be updated doesn't exist
func UpdateActaInicioById(m *ActaInicio) (err error) {
	o := orm.NewOrm()
	v := ActaInicio{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteActaInicio desactiva el registro (borrado lógico: activo = false) y
// returns error if the record to be deleted doesn't exist
func DeleteActaInicio(id int) (err error) {
	o := orm.NewOrm()
	v := ActaInicio{Id: id}
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
