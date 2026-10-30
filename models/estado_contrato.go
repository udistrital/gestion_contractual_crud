package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type EstadoContrato struct {
	Id                       int              `orm:"column(id);pk;auto"`
	ContratoGeneralId        *ContratoGeneral `orm:"column(contrato_general_id);rel(fk)"`
	EstadoParametroId        int              `orm:"column(estado_parametro_id);null"`
	EstadoInternoParametroId int              `orm:"column(estado_interno_parametro_id);null"`
	Actual                   bool             `orm:"column(actual)"`
	Motivo                   string           `orm:"column(motivo);size(250);null"`
	FechaEvento              time.Time        `orm:"column(fecha_evento);type(date);null"`
	UsuarioId                int              `orm:"column(usuario_id)"`
	UsuarioRol               string           `orm:"column(usuario_rol);size(40);null"`
	Activo                   bool             `orm:"column(activo)"`
	FechaCreacion            time.Time        `orm:"column(fecha_creacion);type(timestamp without time zone);auto_now_add"`
	FechaModificacion        time.Time        `orm:"column(fecha_modificacion);type(timestamp without time zone);auto_now"`
}

func (t *EstadoContrato) TableName() string {
	return "estado_contrato"
}

func init() {
	orm.RegisterModel(new(EstadoContrato))
}

// AddEstadoContrato insert a new EstadoContrato into database and returns
// last inserted Id on success.
func AddEstadoContrato(m *EstadoContrato) (id int64, err error) {
	o := orm.NewOrm()
	// Las fechas las asigna el ORM (auto_now_add y auto_now), no el cliente.
	m.FechaCreacion, m.FechaModificacion = time.Time{}, time.Time{}
	id, err = o.Insert(m)
	return
}

// GetEstadoContratoById retrieves EstadoContrato by Id. Returns error if
// Id doesn't exist
func GetEstadoContratoById(id int) (v *EstadoContrato, err error) {
	o := orm.NewOrm()
	v = &EstadoContrato{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllEstadoContrato retrieves all EstadoContrato matches certain condition. Returns empty list if
// no records exist
func GetAllEstadoContrato(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(EstadoContrato)).RelatedSel()
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

	var l []EstadoContrato
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

// UpdateEstadoContrato updates EstadoContrato by Id and returns error if
// the record to be updated doesn't exist
func UpdateEstadoContratoById(m *EstadoContrato) (err error) {
	o := orm.NewOrm()
	v := EstadoContrato{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		// La fecha de creación no cambia; fecha_modificacion la asigna auto_now.
		m.FechaCreacion = v.FechaCreacion
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteEstadoContrato desactiva el registro (borrado lógico: activo = false) y
// returns error if the record to be deleted doesn't exist
func DeleteEstadoContrato(id int) (err error) {
	o := orm.NewOrm()
	v := EstadoContrato{Id: id}
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
