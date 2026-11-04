package controllers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/beego/beego/v2/core/logs"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// EstadoContratoController operations for EstadoContrato
type EstadoContratoController struct {
	BaseController
}

// URLMapping ...
func (c *EstadoContratoController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// Post ...
// @Title Post
// @Description create EstadoContrato
// @Param	body		body 	models.EstadoContrato	true		"body for EstadoContrato content"
// @Success 201 {object} models.EstadoContrato
// @Failure 400 cuerpo inválido
// @router / [post]
func (c *EstadoContratoController) Post() {
	v := models.EstadoContrato{Activo: true}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &v); err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service POST: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	// ADVERTENCIA: no enviar Id en el POST, ni en pruebas. Se inserta tal cual y mueve la secuencia; con 2147483647 bloquea las altas de la tabla.
	if err := models.Validar(&v); err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service POST: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	id, err := models.AddEstadoContratoActual(&v)
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service POST: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	// Se responde con el registro tal como quedó guardado.
	if guardado, err := models.GetEstadoContratoById(int(id)); err == nil {
		v = *guardado
	}
	c.responder(http.StatusCreated, "Registration successful", v)
}

// GetOne ...
// @Title Get One
// @Description get EstadoContrato by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.EstadoContrato
// @Failure 404 :id no encontrado
// @router /:id [get]
func (c *EstadoContratoController) GetOne() {
	id, err := c.id()
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service GetOne: The request contains an incorrect parameter or no record exists"
		c.Abort("400")
	}
	v, err := models.GetEstadoContratoById(id)
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service GetOne: The request contains an incorrect parameter or no record exists"
		c.Abort("404")
	}
	c.responder(http.StatusOK, "Request successful", v)
}

// GetAll ...
// @Title Get All
// @Description get EstadoContrato
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.EstadoContrato
// @Failure 400 parámetros inválidos
// @router / [get]
func (c *EstadoContratoController) GetAll() {
	var fields []string
	var sortby []string
	var order []string
	var query = make(map[string]string)
	var limit int64 = 10
	var offset int64

	// fields: col1,col2,entity.col3
	if v := c.GetString("fields"); v != "" {
		fields = strings.Split(v, ",")
	}
	// limit: 10 (default is 10)
	if v, err := c.GetInt64("limit"); err == nil {
		limit = v
	}
	// offset: 0 (default is 0)
	if v, err := c.GetInt64("offset"); err == nil {
		offset = v
	}
	// sortby: col1,col2
	if v := c.GetString("sortby"); v != "" {
		sortby = strings.Split(v, ",")
	}
	// order: desc,asc
	if v := c.GetString("order"); v != "" {
		order = strings.Split(v, ",")
	}
	// query: k:v,k:v
	if v := c.GetString("query"); v != "" {
		for _, cond := range strings.Split(v, ",") {
			kv := strings.SplitN(cond, ":", 2)
			if len(kv) != 2 {
				logs.Error("Error: invalid query key/value pair")
				c.Data["message"] = "Error service GetAll: invalid query parameter. Expected format: query=campo:valor,campo2:valor2"
				c.Abort("400")
			}
			k, v := kv[0], kv[1]
			query[k] = v
		}
	}

	l, err := models.GetAllEstadoContrato(query, fields, sortby, order, offset, limit)
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service GetAll: The request contains an incorrect parameter or no record exists"
		c.Abort("400")
	}
	if l == nil {
		l = []interface{}{}
	}
	c.responderLista(l, new(models.EstadoContrato), query, limit, offset)
}

// Put ...
// @Title Put
// @Description update the EstadoContrato
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.EstadoContrato	true		"body for EstadoContrato content"
// @Success 200 {object} models.EstadoContrato
// @Failure 400 cuerpo inválido o Id distinto al de la ruta
// @Failure 404 :id no encontrado
// @router /:id [put]
func (c *EstadoContratoController) Put() {
	id, err := c.id()
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Put: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	// Se parte del registro guardado: los campos que no vienen en el cuerpo no cambian.
	v, err := models.GetEstadoContratoById(id)
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Put: The request contains an incorrect data type or an invalid parameter"
		c.Abort("404")
	}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, v); err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Put: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	if v.Id != id {
		logs.Error("El Id del cuerpo no coincide con el de la ruta")
		c.Data["message"] = "Error service Put: The id cannot be modified"
		c.Abort("400")
	}
	if err := models.Validar(v); err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Put: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	if err := models.UpdateEstadoContratoById(v); err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Put: The request contains an incorrect data type or an invalid parameter"
		c.Abort("400")
	}
	v, _ = models.GetEstadoContratoById(id)
	c.responder(http.StatusOK, "Update successful", v)
}

// Delete ...
// @Title Delete
// @Description desactiva el EstadoContrato (borrado lógico)
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} registro desactivado (activo = false)
// @Failure 404 :id no encontrado
// @router /:id [delete]
func (c *EstadoContratoController) Delete() {
	id, err := c.id()
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Delete: Request contains incorrect parameter"
		c.Abort("400")
	}
	if err := models.DeleteEstadoContrato(id); err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service Delete: Request contains incorrect parameter"
		c.Abort("404")
	}
	c.responder(http.StatusOK, "Delete successful", map[string]int{"Id": id})
}
