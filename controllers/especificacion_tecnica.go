package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// EspecificacionTecnicaController operations for EspecificacionTecnica
type EspecificacionTecnicaController struct {
	BaseController
}

// URLMapping ...
func (c *EspecificacionTecnicaController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// Post ...
// @Title Post
// @Description create EspecificacionTecnica
// @Param	body		body 	models.EspecificacionTecnica	true		"body for EspecificacionTecnica content"
// @Success 201 {object} models.EspecificacionTecnica
// @Failure 400 cuerpo inválido
// @router / [post]
func (c *EspecificacionTecnicaController) Post() {
	v := models.EspecificacionTecnica{Activo: true}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &v); err != nil {
		c.responderError(errorCuerpo(err))
		return
	}
	// El Id lo asigna la secuencia de la tabla: el que envíe el cliente se descarta.
	v.Id = 0
	if err := models.Validar(&v); err != nil {
		c.responderError(err)
		return
	}
	id, err := models.AddEspecificacionTecnica(&v)
	if err != nil {
		c.responderError(err)
		return
	}
	// Se responde con el registro tal como quedó guardado.
	if guardado, err := models.GetEspecificacionTecnicaById(int(id)); err == nil {
		v = *guardado
	}
	c.responder(http.StatusCreated, "Registration successful", v)
}

// GetOne ...
// @Title Get One
// @Description get EspecificacionTecnica by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.EspecificacionTecnica
// @Failure 404 :id no encontrado
// @router /:id [get]
func (c *EspecificacionTecnicaController) GetOne() {
	id, err := c.id()
	if err != nil {
		c.responderError(err)
		return
	}
	v, err := models.GetEspecificacionTecnicaById(id)
	if err != nil {
		c.responderError(err)
		return
	}
	c.responder(http.StatusOK, "Request successful", v)
}

// GetAll ...
// @Title Get All
// @Description get EspecificacionTecnica
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.EspecificacionTecnica
// @Failure 400 parámetros inválidos
// @router / [get]
func (c *EspecificacionTecnicaController) GetAll() {
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

	l, err := models.GetAllEspecificacionTecnica(query, fields, sortby, order, offset, limit)
	if err != nil {
		c.responderError(errorParametro(err))
		return
	}
	if l == nil {
		l = append(l, map[string]interface{}{})
	}
	c.responderLista(l, new(models.EspecificacionTecnica), query, limit, offset)
}

// Put ...
// @Title Put
// @Description update the EspecificacionTecnica
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.EspecificacionTecnica	true		"body for EspecificacionTecnica content"
// @Success 200 {object} models.EspecificacionTecnica
// @Failure 400 cuerpo inválido o Id distinto al de la ruta
// @Failure 404 :id no encontrado
// @router /:id [put]
func (c *EspecificacionTecnicaController) Put() {
	id, err := c.id()
	if err != nil {
		c.responderError(err)
		return
	}
	// Se parte del registro guardado: los campos que no vienen en el cuerpo no cambian.
	v, err := models.GetEspecificacionTecnicaById(id)
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
	if err := models.UpdateEspecificacionTecnicaById(v); err != nil {
		c.responderError(err)
		return
	}
	v, _ = models.GetEspecificacionTecnicaById(id)
	c.responder(http.StatusOK, "Update successful", v)
}

// Delete ...
// @Title Delete
// @Description desactiva el EspecificacionTecnica (borrado lógico)
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} registro desactivado (activo = false)
// @Failure 404 :id no encontrado
// @router /:id [delete]
func (c *EspecificacionTecnicaController) Delete() {
	id, err := c.id()
	if err != nil {
		c.responderError(err)
		return
	}
	if err := models.DeleteEspecificacionTecnica(id); err != nil {
		c.responderError(err)
		return
	}
	c.responder(http.StatusOK, "Delete successful", map[string]int{"Id": id})
}
