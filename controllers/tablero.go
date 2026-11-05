package controllers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/beego/beego/v2/core/logs"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// TableroController expone los metadatos de los tableros de seguimiento.
// Son consultas de solo lectura: responden Ids, sin nombres ni datos sensibles.
type TableroController struct {
	BaseController
}

// URLMapping ...
func (c *TableroController) URLMapping() {
	c.Mapping("GetContratos", c.GetContratos)
}

// GetContratos ...
// @Title Contratos del tablero
// @Description metadatos de seguimiento por contrato activo: estado general actual, fecha desde la que está en ese estado, fecha final, dependencia y sede solicitante y abogado (solo Ids)
// @Param	vigencia-id	query	int	false	"Id del parámetro de vigencia (contrato_general.vigencia_id)"
// @Param	abogado-id	query	int	false	"usuario_id del abogado que registró el contrato"
// @Param	dependencia-solicitante-id	query	string	false	"Una o varias dependencias solicitantes separadas por coma. e.g. 31,45"
// @Success 200 {object} []models.ContratoTablero
// @Failure 400 filtro inválido
// @router /contratos [get]
func (c *TableroController) GetContratos() {
	f, err := c.filtroTablero()
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service GetAll: The request contains an incorrect parameter or no record exists"
		c.Abort("400")
	}
	l, err := models.GetContratosTablero(f)
	if err != nil {
		logs.Error(err)
		c.Data["message"] = "Error service GetAll: The request contains an incorrect parameter or no record exists"
		c.Abort("400")
	}
	c.responder(http.StatusOK, "Request successful", l)
}

// filtroTablero lee los filtros opcionales. Un filtro presente que no sea un
// entero positivo es un error de la solicitud.
func (c *TableroController) filtroTablero() (f models.FiltroTablero, err error) {
	if f.VigenciaId, err = enteroPositivo(c.GetString("vigencia-id"), "vigencia-id"); err != nil {
		return f, err
	}
	if f.AbogadoId, err = enteroPositivo(c.GetString("abogado-id"), "abogado-id"); err != nil {
		return f, err
	}
	if v := c.GetString("dependencia-solicitante-id"); v != "" {
		if f.DependenciaSolicitanteIds, err = listaEnterosPositivos(v, "dependencia-solicitante-id"); err != nil {
			return f, err
		}
	}
	return f, nil
}

// listaEnterosPositivos convierte una lista separada por coma, sin repetidos y
// en el orden en que llegó. Un elemento vacío o inválido es un error.
func listaEnterosPositivos(valor, nombre string) ([]int, error) {
	var ids []int
	vistos := map[int]bool{}
	for _, texto := range strings.Split(valor, ",") {
		id, err := enteroPositivo(texto, nombre)
		if err != nil || id == 0 {
			return nil, errors.New(nombre + " debe ser uno o varios enteros positivos separados por coma")
		}
		if !vistos[id] {
			vistos[id] = true
			ids = append(ids, id)
		}
	}
	return ids, nil
}

// enteroPositivo convierte el valor de un filtro; vacío es 0 (sin filtro).
func enteroPositivo(valor, nombre string) (int, error) {
	valor = strings.TrimSpace(valor)
	if valor == "" {
		return 0, nil
	}
	n, err := strconv.Atoi(valor)
	if err != nil || n < 1 {
		return 0, errors.New(nombre + " debe ser un número entero positivo")
	}
	return n, nil
}
