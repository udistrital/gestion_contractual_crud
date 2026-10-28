package models

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/beego/beego/v2/client/orm"
)

type EstadoPoliza struct {
	Id                int       `orm:"column(id);pk;auto"`
	PolizaId          *Poliza   `orm:"column(poliza_id);rel(fk)"`
	EstadoParametroId int       `orm:"column(estado_parametro_id)"`
	Motivo            string    `orm:"column(motivo);null"`
	UsuarioId         int       `orm:"column(usuario_id)"`
	UsuarioRol        string    `orm:"column(usuario_rol);null"`
	Activo            bool      `orm:"column(activo)"`
	FechaCreacion     time.Time `orm:"column(fecha_creacion);type(timestamp without time zone)"`
	FechaModificacion time.Time `orm:"column(fecha_modificacion);type(timestamp without time zone)"`
}

func (t *EstadoPoliza) TableName() string {
	return "estado_poliza"
}

func init() {
	orm.RegisterModel(new(EstadoPoliza))
}

// AddEstadoPoliza insert a new EstadoPoliza into database and returns
// last inserted Id on success.
func AddEstadoPoliza(m *EstadoPoliza) (id int64, err error) {
	o := orm.NewOrm()
	id, err = o.Insert(m)
	return
}

// GetEstadoPolizaById retrieves EstadoPoliza by Id. Returns error if
// Id doesn't exist
func GetEstadoPolizaById(id int) (v *EstadoPoliza, err error) {
	o := orm.NewOrm()
	v = &EstadoPoliza{Id: id}
	if err = o.Read(v); err == nil {
		return v, nil
	}
	return nil, err
}

// GetAllEstadoPoliza retrieves all EstadoPoliza matches certain condition. Returns empty list if
// no records exist
func GetAllEstadoPoliza(query map[string]string, fields []string, sortby []string, order []string,
	offset int64, limit int64) (ml []interface{}, err error) {
	o := orm.NewOrm()
	qs := o.QueryTable(new(EstadoPoliza)).RelatedSel()
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

	var l []EstadoPoliza
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

// UpdateEstadoPoliza updates EstadoPoliza by Id and returns error if
// the record to be updated doesn't exist
func UpdateEstadoPolizaById(m *EstadoPoliza) (err error) {
	o := orm.NewOrm()
	v := EstadoPoliza{Id: m.Id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Update(m); err == nil {
			fmt.Println("Number of records updated in database:", num)
		}
	}
	return
}

// DeleteEstadoPoliza deletes EstadoPoliza by Id and returns error if
// the record to be deleted doesn't exist
func DeleteEstadoPoliza(id int) (err error) {
	o := orm.NewOrm()
	v := EstadoPoliza{Id: id}
	// ascertain id exists in the database
	if err = o.Read(&v); err == nil {
		var num int64
		if num, err = o.Delete(&EstadoPoliza{Id: id}); err == nil {
			fmt.Println("Number of records deleted in database:", num)
		}
	}
	return
}
