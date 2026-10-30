package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type RegistroPresupuestal struct {
	Id                           int                         `orm:"column(id);pk;auto"`
	DisponibilidadPresupuestalId *DisponibilidadPresupuestal `orm:"column(disponibilidad_presupuestal_id);rel(fk)"`
	NumeroRegistroPresupuestal   int                         `orm:"column(numero_registro_presupuestal);null"`
	VigenciaRpId                 int                         `orm:"column(vigencia_rp_id);null"`
	FechaRegistro                time.Time                   `orm:"column(fecha_registro);type(date);null"`
	Activo                       bool                        `orm:"column(activo)"`
	FechaCreacion                time.Time                   `orm:"column(fecha_creacion);type(timestamp without time zone);auto_now_add"`
	FechaModificacion            time.Time                   `orm:"column(fecha_modificacion);type(timestamp without time zone);auto_now"`
}

func (t *RegistroPresupuestal) TableName() string {
	return "registro_presupuestal"
}

func init() {
	orm.RegisterModel(new(RegistroPresupuestal))
}

// AddRegistroPresupuestal insert a new RegistroPresupuestal into database and returns
// last inserted Id on success.
func AddRegistroPresupuestal(m *RegistroPresupuestal) (id int64, err error) {
	o := orm.NewOrm()
	// Las fechas las asigna el ORM (auto_now_add y auto_now), no el cliente.
	m.FechaCreacion, m.FechaModificacion = time.Time{}, time.Time{}
	id, err = o.Insert(m)
	return
}

// GetRegistroPresupuestalById retrieves RegistroPresupuestal by Id. Returns error if
// Id doesn't exist
func GetRegistroPresupuestalById(id int) (v *RegistroPresupuestal, err error) {
	o := orm.NewOrm()
	v = &RegistroPresupuestal{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllRegistroPresupuestal retrieves all RegistroPresupuestal matches certain condition. Returns empty list if
// no records exist
func GetAllRegistroPresupuestal(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(RegistroPresupuestal)).RelatedSel()
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

	var l []RegistroPresupuestal
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

// UpdateRegistroPresupuestal updates RegistroPresupuestal by Id and returns error if
// the record to be updated doesn't exist
func UpdateRegistroPresupuestalById(m *RegistroPresupuestal) (err error) {
	o := orm.NewOrm()
	v := RegistroPresupuestal{Id: m.Id}
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

// DeleteRegistroPresupuestal desactiva el registro (borrado lógico: activo = false) y
// returns error if the record to be deleted doesn't exist
func DeleteRegistroPresupuestal(id int) (err error) {
	o := orm.NewOrm()
	v := RegistroPresupuestal{Id: id}
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
