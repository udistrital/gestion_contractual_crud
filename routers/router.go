// @APIVersion 0.1.0
// @Title gestion_contractual_crud
// @Description API CRUD de gestión contractual (ARGO) sobre las tablas del modelo conceptual ARGO
// @Contact computo@udistrital.edu.co
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"github.com/udistrital/gestion_contractual_crud/controllers"

	beego "github.com/beego/beego/v2/server/web"
)

func init() {
	ns := beego.NewNamespace("/v1",

		beego.NSNamespace("/contratos-generales",
			beego.NSInclude(
				&controllers.ContratoGeneralController{},
			),
		),

		beego.NSNamespace("/estados-contrato",
			beego.NSInclude(
				&controllers.EstadoContratoController{},
			),
		),

		beego.NSNamespace("/supervisores",
			beego.NSInclude(
				&controllers.SupervisorContratoController{},
			),
		),

		beego.NSNamespace("/ordenadores-contrato",
			beego.NSInclude(
				&controllers.OrdenadorContratoController{},
			),
		),

		beego.NSNamespace("/contratos-arrendamiento",
			beego.NSInclude(
				&controllers.ContratoArrendamientoController{},
			),
		),

		beego.NSNamespace("/convenios",
			beego.NSInclude(
				&controllers.ConvenioController{},
			),
		),

		beego.NSNamespace("/especificaciones-tecnicas",
			beego.NSInclude(
				&controllers.EspecificacionTecnicaController{},
			),
		),

		beego.NSNamespace("/disponibilidades-presupuestales",
			beego.NSInclude(
				&controllers.DisponibilidadPresupuestalController{},
			),
		),

		beego.NSNamespace("/registros-presupuestales",
			beego.NSInclude(
				&controllers.RegistroPresupuestalController{},
			),
		),

		beego.NSNamespace("/polizas",
			beego.NSInclude(
				&controllers.PolizaController{},
			),
		),

		beego.NSNamespace("/estados-poliza",
			beego.NSInclude(
				&controllers.EstadoPolizaController{},
			),
		),

		beego.NSNamespace("/amparos-polizas",
			beego.NSInclude(
				&controllers.AmparoPolizaController{},
			),
		),

		beego.NSNamespace("/documentos-contratos",
			beego.NSInclude(
				&controllers.DocumentoContratoController{},
			),
		),

		beego.NSNamespace("/actas-inicio",
			beego.NSInclude(
				&controllers.ActaInicioController{},
			),
		),

		beego.NSNamespace("/tableros",
			beego.NSInclude(
				&controllers.TableroController{},
			),
		),
	)
	beego.AddNamespace(ns)
}
