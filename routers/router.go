// @APIVersion 1.0.0
// @Title beego Test API
// @Description beego has a very cool tools to autogenerate documents for your API
// @Contact astaxie@gmail.com
// @TermsOfServiceUrl http://beego.me/
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"github.com/udistrital/gestion_contractual_crud/controllers"

	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	ns := beego.NewNamespace("/v1",

		beego.NSNamespace("/contrato_general",
			beego.NSInclude(
				&controllers.ContratoGeneralController{},
			),
		),

		beego.NSNamespace("/estado_contrato",
			beego.NSInclude(
				&controllers.EstadoContratoController{},
			),
		),

		beego.NSNamespace("/supervisor_contrato",
			beego.NSInclude(
				&controllers.SupervisorContratoController{},
			),
		),

		beego.NSNamespace("/ordenador_contrato",
			beego.NSInclude(
				&controllers.OrdenadorContratoController{},
			),
		),

		beego.NSNamespace("/contrato_arrendamiento",
			beego.NSInclude(
				&controllers.ContratoArrendamientoController{},
			),
		),

		beego.NSNamespace("/convenio",
			beego.NSInclude(
				&controllers.ConvenioController{},
			),
		),

		beego.NSNamespace("/especificacion_tecnica",
			beego.NSInclude(
				&controllers.EspecificacionTecnicaController{},
			),
		),

		beego.NSNamespace("/disponibilidad_presupuestal",
			beego.NSInclude(
				&controllers.DisponibilidadPresupuestalController{},
			),
		),

		beego.NSNamespace("/registro_presupuestal",
			beego.NSInclude(
				&controllers.RegistroPresupuestalController{},
			),
		),

		beego.NSNamespace("/poliza",
			beego.NSInclude(
				&controllers.PolizaController{},
			),
		),

		beego.NSNamespace("/estado_poliza",
			beego.NSInclude(
				&controllers.EstadoPolizaController{},
			),
		),

		beego.NSNamespace("/amparo_poliza",
			beego.NSInclude(
				&controllers.AmparoPolizaController{},
			),
		),

		beego.NSNamespace("/documento_contrato",
			beego.NSInclude(
				&controllers.DocumentoContratoController{},
			),
		),

		beego.NSNamespace("/acta_inicio",
			beego.NSInclude(
				&controllers.ActaInicioController{},
			),
		),
	)
	beego.AddNamespace(ns)
}
