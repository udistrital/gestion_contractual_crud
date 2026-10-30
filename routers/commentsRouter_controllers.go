package routers

import (
	beego "github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/context/param"
)

func init() {

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ActaInicioController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:AmparoPolizaController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoArrendamientoController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "ConteoConsecutivo",
			Router:           `/conteo-consecutivo`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ContratoGeneralController"],
		beego.ControllerComments{
			Method:           "ConteoNumeroContrato",
			Router:           `/conteo-numero-contrato`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:ConvenioController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DisponibilidadPresupuestalController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:DocumentoContratoController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EspecificacionTecnicaController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoContratoController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:EstadoPolizaController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:OrdenadorContratoController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:PolizaController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:RegistroPresupuestalController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"],
		beego.ControllerComments{
			Method:           "Post",
			Router:           `/`,
			AllowHTTPMethods: []string{"post"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"],
		beego.ControllerComments{
			Method:           "GetAll",
			Router:           `/`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"],
		beego.ControllerComments{
			Method:           "GetOne",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"get"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"],
		beego.ControllerComments{
			Method:           "Put",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"put"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

	beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"] = append(beego.GlobalControllerRouter["github.com/udistrital/gestion_contractual_crud/controllers:SupervisorContratoController"],
		beego.ControllerComments{
			Method:           "Delete",
			Router:           `/:id`,
			AllowHTTPMethods: []string{"delete"},
			MethodParams:     param.Make(),
			Filters:          nil,
			Params:           nil})

}
