package controllers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/beego/beego/v2/core/logs"
	beego "github.com/beego/beego/v2/server/web"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// Respuesta es el formato de respuesta de las APIs de la OAS
// (el mismo que usa sicapital_crud).
type Respuesta struct {
	Success  bool        `json:"Success"`
	Status   string      `json:"Status"`
	Message  string      `json:"Message"`
	Data     interface{} `json:"Data"`
	Metadata *Metadata   `json:"Metadata,omitempty"`
}

// Metadata es la paginación que devolvía el GET / del CRUD en NestJS
// (generateMetadata de base-crud.service.ts); el MF la usa para el paginador.
type Metadata struct {
	Total           int64 `json:"total"`
	Limit           int64 `json:"limit"`
	Offset          int64 `json:"offset"`
	CurrentPage     int64 `json:"currentPage"`
	TotalPages      int64 `json:"totalPages"`
	HasNextPage     bool  `json:"hasNextPage"`
	HasPreviousPage bool  `json:"hasPreviousPage"`
}

// BaseController reúne la forma de responder de todos los controladores.
type BaseController struct {
	beego.Controller
}

func (c *BaseController) responder(status int, mensaje string, data interface{}) {
	c.Ctx.Output.SetStatus(status)
	c.Data["json"] = Respuesta{Success: true, Status: strconv.Itoa(status), Message: mensaje, Data: data}
	_ = c.ServeJSON()
}

// responderLista responde el GET / con Metadata, como el CRUD en NestJS: total
// es el número de registros que cumplen query, sin limit ni offset. limit 0
// trae todos (una sola página).
func (c *BaseController) responderLista(l []interface{}, modelo interface{}, query map[string]string, limit, offset int64) {
	total, err := models.ContarRegistros(modelo, query)
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service GetAll: The request contains an incorrect parameter or no record exists"
		c.Abort("400")
	}
	if limit < 0 {
		limit = 0
	}
	m := &Metadata{Total: total, Limit: limit, Offset: offset, CurrentPage: 1, TotalPages: 1}
	if limit > 0 {
		m.CurrentPage = offset/limit + 1
		m.TotalPages = (total + limit - 1) / limit
		m.HasNextPage = m.CurrentPage < m.TotalPages
	}
	m.HasPreviousPage = m.CurrentPage > 1
	c.Ctx.Output.SetStatus(http.StatusOK)
	c.Data["json"] = Respuesta{Success: true, Status: strconv.Itoa(http.StatusOK), Message: "Request successful", Data: l, Metadata: m}
	_ = c.ServeJSON()
}

// HandlerFunc ejecuta el método del controlador (Post, GetOne, GetAll, Put,
// Delete). Los errores los responde customerror de utils_oas (registrado en
// main.go) a través de c.Abort; customerror llama a xray.EndSegment y
// auditoria.LogRequest.
//
// El ORM de Beego no devuelve error sino que entra en pánico cuando query, fields
// o sortby nombran un campo que no existe o traen un valor que no corresponde al
// tipo; ese caso se responde 400. Otro pánico con error se responde 500 por
// customerror, para que no se salte xray ni auditoria. El pánico de c.Abort no es
// un error, sino el código en texto, y sigue su curso.
func (c *BaseController) HandlerFunc(nombre string) bool {
	defer func() {
		if r := recover(); r != nil {
			if err, ok := r.(error); ok {
				logs.Error(err)
				if errorDeConsulta(err) {
					c.Data["message"] = "Error service GetAll: The request contains an incorrect parameter or no record exists"
					c.Abort("400")
				}
				c.Data["message"] = "Error interno del servidor"
				c.Abort("500")
			}
			panic(r)
		}
	}()
	return c.Controller.HandlerFunc(nombre)
}

// errorDeConsulta reconoce los pánicos del ORM causados por los parámetros
// de la consulta.
func errorDeConsulta(err error) bool {
	for _, texto := range []string{"field/column name", "operator `", "Raw value:"} {
		if strings.Contains(err.Error(), texto) {
			return true
		}
	}
	return false
}

// id lee el parámetro :id de la ruta.
func (c *BaseController) id() (int, error) {
	id, err := strconv.Atoi(c.Ctx.Input.Param(":id"))
	if err != nil || id < 1 {
		return 0, errors.New(":id debe ser un número entero positivo")
	}
	return id, nil
}
