package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/beego/beego/v2/client/orm"
	"github.com/beego/beego/v2/core/logs"
	beego "github.com/beego/beego/v2/server/web"
	"github.com/lib/pq"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// Respuesta es el formato de respuesta de las APIs de la OAS
// (el mismo que usa sicapital_crud).
type Respuesta struct {
	Success bool        `json:"Success"`
	Status  string      `json:"Status"`
	Message string      `json:"Message"`
	Data    interface{} `json:"Data"`
}

// errSolicitud marca los errores del cliente (cuerpo o parámetros inválidos).
type errSolicitud struct {
	mensaje string
	err     error
}

func (e *errSolicitud) Error() string { return e.mensaje + ": " + e.err.Error() }

func errorCuerpo(err error) error {
	return &errSolicitud{mensaje: "El cuerpo de la solicitud no es válido", err: err}
}

func errorParametro(err error) error {
	return &errSolicitud{mensaje: "Parámetros de consulta inválidos", err: err}
}

// errorIdCuerpo rechaza un PUT que intenta cambiar el Id del registro.
func errorIdCuerpo(idRuta, idCuerpo int) error {
	return &errSolicitud{
		mensaje: "El Id del cuerpo no coincide con el de la ruta",
		err:     fmt.Errorf("Id de la ruta %d, Id del cuerpo %d", idRuta, idCuerpo),
	}
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

// responderError replica a mano el manejo de errores que deja refactor_controller
// (control_error_json_crud.md; el script no se ejecutó): registra el error con
// logs.Error, deja el mensaje del lineamiento en c.Data["message"] y el motivo
// específico en c.Data["data"], y llama a c.Abort con el
// código. La respuesta la arma customerror.CustomErrorController de utils_oas
// (registrado en main.go) con el formato {Success, Status, Message, Data}.
// customerror solo atiende 400, 401, 404 y 5xx, por eso un duplicado es 400.
func (c *BaseController) responderError(err error) {
	logs.Error(err)
	var validacion *models.ErrValidacion
	var solicitud *errSolicitud
	var errPq *pq.Error
	switch {
	case errors.As(err, &validacion):
		c.abortar("400", "Datos inválidos", validacion.Errores)
	case errors.As(err, &solicitud):
		c.abortar("400", solicitud.mensaje, solicitud.err.Error())
	case errors.Is(err, orm.ErrNoRows):
		c.abortar("404", "Registro no encontrado", nil)
	case errors.Is(err, models.ErrNoEncontrado):
		// Es un parámetro inválido del cuerpo (entidad_id de documento_contrato): 400, como una FK inexistente.
		c.abortar("400", "Registro relacionado no encontrado", strings.TrimPrefix(err.Error(), models.ErrNoEncontrado.Error()+": "))
	case errors.As(err, &errPq) && errPq.Code == "23505":
		c.abortar("400", "Ya existe un registro con los mismos datos", errPq.Detail)
	case errors.As(err, &errPq) && errPq.Code == "23503":
		c.abortar("400", "El registro relacionado no existe", errPq.Detail)
	default:
		c.abortar("500", "Error interno del servidor", nil)
	}
}

// mensajeServicio es el Message que refactor_controller deja en cada operación.
func (c *BaseController) mensajeServicio() string {
	switch c.Ctx.Input.Method() {
	case http.MethodPost:
		return "Error service POST: The request contains an incorrect data type or an invalid parameter"
	case http.MethodPut:
		return "Error service Put: The request contains an incorrect data type or an invalid parameter"
	case http.MethodDelete:
		return "Error service Delete: Request contains incorrect parameter"
	}
	if c.Ctx.Input.Param(":id") != "" {
		return "Error service GetOne: The request contains an incorrect parameter or no record exists"
	}
	return "Error service GetAll: The request contains an incorrect parameter or no record exists"
}

// abortar deja el Message del lineamiento en los errores 400 y 404; el motivo específico
// (campo inválido, duplicado, relación inexistente) viaja en Data. El 500 conserva su texto.
func (c *BaseController) abortar(status, mensaje string, data interface{}) {
	if status != "500" {
		switch d := data.(type) {
		case nil:
			data = mensaje
		case string:
			data = mensaje + ": " + d
		}
		mensaje = c.mensajeServicio()
	}
	c.Data["message"] = mensaje
	c.Data["data"] = data
	c.Abort(status)
}

// HandlerFunc ejecuta el método del controlador (Post, GetOne, GetAll, Put,
// Delete). El ORM de Beego no devuelve error sino que entra en pánico cuando
// query, fields o sortby nombran un campo que no existe o traen un valor que no
// corresponde al tipo; ese caso es un error de la solicitud y se responde 400.
// Cualquier otro pánico sigue su curso (500).
func (c *BaseController) HandlerFunc(nombre string) bool {
	defer func() {
		if r := recover(); r != nil {
			if err, ok := r.(error); ok && errorDeConsulta(err) {
				c.responderError(errorParametro(err))
				return
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
		return 0, errorParametro(errors.New(":id debe ser un número entero positivo"))
	}
	return id, nil
}
