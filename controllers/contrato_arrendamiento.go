package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// ContratoArrendamientoController operations for ContratoArrendamiento
type ContratoArrendamientoController struct {
	BaseController
}

// URLMapping ...
func (c *ContratoArrendamientoController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// Post ...
// @Title Post
// @Description create ContratoArrendamiento
// @Param	body		body 	models.ContratoArrendamiento	true		"body for ContratoArrendamiento content"
// @Success 201 {object} models.ContratoArrendamiento
// @Failure 400 cuerpo inválido
// @router / [post]
func (c *ContratoArrendamientoController) Post() {
	v := models.ContratoArrendamiento{Activo: true}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &v); err != nil {
		c.responderError(errorCuerpo(err))
		return
	}
	if err := models.Validar(&v); err != nil {
		c.responderError(err)
		return
	}
	id, err := models.AddContratoArrendamiento(&v)
	if err != nil {
		c.responderError(err)
		return
	}
	// Se responde con el registro tal como quedó guardado.
	if guardado, err := models.GetContratoArrendamientoById(int(id)); err == nil {
		v = *guardado
	}
	c.responder(http.StatusCreated, "Registro creado", v)
}

// GetOne ...
// @Title Get One
// @Description get ContratoArrendamiento by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.ContratoArrendamiento
// @Failure 404 :id no encontrado
// @router /:id [get]
func (c *ContratoArrendamientoController) GetOne() {
	id, err := c.id()
	if err != nil {
		c.responderError(err)
		return
	}
	v, err := models.GetContratoArrendamientoById(id)
	if err != nil {
		c.responderError(err)
		return
	}
	c.responder(http.StatusOK, "Registro encontrado", v)
}

// GetAll ...
// @Title Get All
// @Description get ContratoArrendamiento
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.ContratoArrendamiento
// @Failure 400 parámetros inválidos
// @router / [get]
func (c *ContratoArrendamientoController) GetAll() {
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
				c.responderError(errorParametro(errors.New("Error: invalid query key/value pair")))
				return
			}
			k, v := kv[0], kv[1]
			query[k] = v
		}
	}

	l, err := models.GetAllContratoArrendamiento(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.responderError(errorParametro(err))
		return
	}
	if l == nil {
		l = []interface{}{}
	}
	c.responder(http.StatusOK, "Registros encontrados", l)
}

// Put ...
// @Title Put
// @Description update the ContratoArrendamiento
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.ContratoArrendamiento	true		"body for ContratoArrendamiento content"
// @Success 200 {object} models.ContratoArrendamiento
// @Failure 400 cuerpo inválido o Id distinto al de la ruta
// @Failure 404 :id no encontrado
// @router /:id [put]
func (c *ContratoArrendamientoController) Put() {
	id, err := c.id()
	if err != nil {
		c.responderError(err)
		return
	}
	// Se parte del registro guardado: los campos que no vienen en el cuerpo no cambian.
	v, err := models.GetContratoArrendamientoById(id)
	if err != nil {
		c.responderError(err)
		return
	}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, v); err != nil {
		c.responderError(errorCuerpo(err))
		return
	}
	if v.Id != id {
		c.responderError(errorIdCuerpo(id, v.Id))
		return
	}
	if err := models.Validar(v); err != nil {
		c.responderError(err)
		return
	}
	if err := models.UpdateContratoArrendamientoById(v); err != nil {
		c.responderError(err)
		return
	}
	v, _ = models.GetContratoArrendamientoById(id)
	c.responder(http.StatusOK, "Registro actualizado", v)
}

// Delete ...
// @Title Delete
// @Description desactiva el ContratoArrendamiento (borrado lógico)
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} registro desactivado (activo = false)
// @Failure 404 :id no encontrado
// @router /:id [delete]
func (c *ContratoArrendamientoController) Delete() {
	id, err := c.id()
	if err != nil {
		c.responderError(err)
		return
	}
	if err := models.DeleteContratoArrendamiento(id); err != nil {
		c.responderError(err)
		return
	}
	c.responder(http.StatusOK, "Registro desactivado", map[string]int{"Id": id})
}
