package tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/udistrital/gestion_contractual_crud/models"
)

// Recorre los 5 endpoints de las 14 tablas contra PostgreSQL, con los casos
// de éxito y de error de cada uno. Solo corre con
// GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION=true (ver integracion_test.go).

type recurso struct {
	ruta       string
	cuerpo     string // cuerpo válido para POST
	cambio     string // cuerpo para PUT
	campo      string // campo que cambia el PUT
	valor      interface{}
	invalido   string // cuerpo que no pasa la validación
	filtro     string // valor de query para GetAll
	ordenarPor string
}

func recursos(contrato, poliza, cdp, acta int) []recurso {
	cg := fmt.Sprintf(`"ContratoGeneralId":{"Id":%d}`, contrato)
	return []recurso{
		{"/v1/contrato_general", fmt.Sprintf(`{"UnidadEjecutoraId":1,"NumeroContrato":"CRUD-%d","VigenciaId":2026}`, time.Now().UnixNano()),
			`{"Objeto":"Nuevo objeto"}`, "Objeto", "Nuevo objeto", `{"VigenciaId":2026}`, "UnidadEjecutoraId:1", "VigenciaId"},
		{"/v1/supervisor_contrato", `{` + cg + `,"SedeId":1,"DependenciaId":2}`,
			`{"CargoLegado":"Supervisor"}`, "CargoLegado", "Supervisor", `{` + cg + `,"SedeId":1}`, "SedeId:1", "DependenciaId"},
		{"/v1/ordenador_contrato", `{` + cg + `,"TerceroId":3}`,
			`{"Resolucion":"R-1"}`, "Resolucion", "R-1", `{"TerceroId":3}`, "TerceroId:3", "TerceroId"},
		{"/v1/estado_contrato", `{` + cg + `,"EstadoParametroId":1,"UsuarioId":1}`,
			`{"Motivo":"Ajuste"}`, "Motivo", "Ajuste", `{` + cg + `}`, "UsuarioId:1", "EstadoParametroId"},
		{"/v1/convenio", `{` + cg + `,"Nombre":"Convenio"}`,
			`{"Vigencia":2027}`, "Vigencia", float64(2027), `{"Nombre":"Sin contrato"}`, "Nombre:Convenio", "Nombre"},
		{"/v1/contrato_arrendamiento", `{` + cg + `,"ValorArrendamiento":100}`,
			`{"Reajuste":"IPC"}`, "Reajuste", "IPC", `{"ValorArrendamiento":100}`, "ValorArrendamiento:100", "ValorArrendamiento"},
		{"/v1/especificacion_tecnica", `{` + cg + `,"Cantidad":2,"ValorUnitario":10}`,
			`{"Cantidad":3}`, "Cantidad", float64(3), `{"ValorUnitario":10}`, "Cantidad:2", "Cantidad"},
		{"/v1/disponibilidad_presupuestal", `{` + cg + `,"NumeroCdpId":10}`,
			`{"VigenciaCdpId":2026}`, "VigenciaCdpId", float64(2026), `{"NumeroCdpId":10}`, "NumeroCdpId:10", "NumeroCdpId"},
		{"/v1/registro_presupuestal", fmt.Sprintf(`{"DisponibilidadPresupuestalId":{"Id":%d},"NumeroRegistroPresupuestal":20}`, cdp),
			`{"VigenciaRpId":2026}`, "VigenciaRpId", float64(2026), `{"NumeroRegistroPresupuestal":20}`, "NumeroRegistroPresupuestal:20", "NumeroRegistroPresupuestal"},
		{"/v1/acta_inicio", `{` + cg + `,"NumeroActa":"A-1"}`,
			`{"NombreInterventor":"Interventor"}`, "NombreInterventor", "Interventor", `{"NumeroActa":"A-1"}`, "NumeroActa:A-1", "NumeroActa"},
		{"/v1/poliza", `{` + cg + `,"NumeroPoliza":"P-1"}`,
			`{"Descripcion":"Póliza"}`, "Descripcion", "Póliza", `{"NumeroPoliza":"P-1"}`, "NumeroPoliza:P-1", "NumeroPoliza"},
		{"/v1/estado_poliza", fmt.Sprintf(`{"PolizaId":{"Id":%d},"EstadoParametroId":5,"UsuarioId":1}`, poliza),
			`{"Motivo":"Aprobada"}`, "Motivo", "Aprobada", `{"EstadoParametroId":5,"UsuarioId":1}`, "EstadoParametroId:5", "EstadoParametroId"},
		{"/v1/amparo_poliza", fmt.Sprintf(`{`+cg+`,"PolizaId":{"Id":%d},"AmparoId":1}`, poliza),
			`{"Valor":500}`, "Valor", float64(500), `{"AmparoId":1}`, "AmparoId:1", "AmparoId"},
		{"/v1/documento_contrato", fmt.Sprintf(`{"EntidadTipo":"acta_inicio","EntidadId":%d}`, acta),
			`{"DocumentoEnlace":"enlace"}`, "DocumentoEnlace", "enlace", `{"EntidadTipo":"otra","EntidadId":1}`, "EntidadTipo:acta_inicio", "EntidadId"},
	}
}

func TestCrudCompletoPorTabla(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1,"VigenciaId":2026}`)
	poliza := crear(t, "/v1/poliza", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d}}`, contrato))
	cdp := crear(t, "/v1/disponibilidad_presupuestal", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d}}`, contrato))
	acta := crear(t, "/v1/acta_inicio", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d}}`, contrato))

	for _, rc := range recursos(contrato, poliza, cdp, acta) {
		t.Run(rc.ruta, func(t *testing.T) {
			id := crear(t, rc.ruta, rc.cuerpo)
			uno := fmt.Sprintf("%s/%d", rc.ruta, id)

			esperar(t, http.MethodPost, rc.ruta, rc.invalido, http.StatusBadRequest)
			esperar(t, http.MethodPost, rc.ruta, `{`, http.StatusBadRequest)

			// GetOne
			esperar(t, http.MethodGet, uno, "", http.StatusOK)
			esperar(t, http.MethodGet, rc.ruta+"/999999", "", http.StatusNotFound)
			esperar(t, http.MethodGet, rc.ruta+"/abc", "", http.StatusBadRequest)

			// GetAll: filtro, campos, orden, límite y desplazamiento.
			codigo, r := solicitar(t, http.MethodGet, rc.ruta+"?query="+rc.filtro+",Id:"+fmt.Sprint(id)+"&fields=Id,"+rc.ordenarPor+"&sortby="+rc.ordenarPor+",Id&order=desc,asc&limit=5&offset=0", "")
			var lista []map[string]interface{}
			_ = json.Unmarshal(r.Data, &lista)
			if codigo != http.StatusOK || len(lista) != 1 || len(lista[0]) != 2 {
				t.Fatalf("GetAll con filtros: %d %s", codigo, r.Data)
			}
			esperar(t, http.MethodGet, rc.ruta+"?sortby=Id&order=desc", "", http.StatusOK)
			esperar(t, http.MethodGet, rc.ruta+"?sortby=Id,"+rc.ordenarPor+"&order=asc", "", http.StatusOK)
			esperar(t, http.MethodGet, rc.ruta+"?query=Id__isnull:false&limit=1", "", http.StatusOK)
			esperar(t, http.MethodGet, rc.ruta+"?sortby=Id&order=arriba", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?sortby=Id,"+rc.ordenarPor+"&order=otro", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?sortby=Id,"+rc.ordenarPor+",Activo&order=asc,desc", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?order=asc", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?query=Id", "", http.StatusBadRequest)
			// Campos que no existen o valores de otro tipo: error de la solicitud, no 500.
			esperar(t, http.MethodGet, rc.ruta+"?query=CampoQueNoExiste:1", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?fields=Id,CampoQueNoExiste", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?sortby=CampoQueNoExiste&order=asc", "", http.StatusBadRequest)
			esperar(t, http.MethodGet, rc.ruta+"?query=Id:abc", "", http.StatusBadRequest)
			codigo, r = solicitar(t, http.MethodGet, rc.ruta+"?query=Id:999999", "")
			if codigo != http.StatusOK || string(r.Data) != "[{}]" {
				t.Fatalf("GetAll sin resultados: %d %s", codigo, r.Data)
			}

			// Put: solo cambia lo enviado.
			codigo, r = solicitar(t, http.MethodPut, uno, rc.cambio)
			var actualizado map[string]interface{}
			_ = json.Unmarshal(r.Data, &actualizado)
			if codigo != http.StatusOK || actualizado[rc.campo] != rc.valor {
				t.Fatalf("PUT: %d %s", codigo, r.Data)
			}
			esperar(t, http.MethodPut, uno, `{"Id":999999}`, http.StatusBadRequest)
			esperar(t, http.MethodPut, uno, `{`, http.StatusBadRequest)
			esperar(t, http.MethodPut, rc.ruta+"/999999", rc.cambio, http.StatusNotFound)
			esperar(t, http.MethodPut, rc.ruta+"/abc", rc.cambio, http.StatusBadRequest)

			// Delete lógico.
			esperar(t, http.MethodDelete, uno, "", http.StatusOK)
			codigo, r = solicitar(t, http.MethodGet, uno, "")
			var borrado struct{ Activo bool }
			_ = json.Unmarshal(r.Data, &borrado)
			if codigo != http.StatusOK || borrado.Activo {
				t.Fatalf("después de DELETE el registro debe seguir con Activo = false: %d %s", codigo, r.Data)
			}
			esperar(t, http.MethodDelete, rc.ruta+"/999999", "", http.StatusNotFound)
			esperar(t, http.MethodDelete, rc.ruta+"/abc", "", http.StatusBadRequest)
		})
	}
}

// Reglas del documento polimórfico: la entidad debe existir y su tipo ser válido.
func TestDocumentoSegunEntidad(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1}`)
	documento := crear(t, "/v1/documento_contrato", fmt.Sprintf(`{"EntidadTipo":"contrato_general","EntidadId":%d}`, contrato))
	esperar(t, http.MethodPost, "/v1/documento_contrato", `{"EntidadTipo":"poliza","EntidadId":999999}`, http.StatusNotFound)
	esperar(t, http.MethodPut, fmt.Sprintf("/v1/documento_contrato/%d", documento), `{"EntidadTipo":"contrato_general","EntidadId":999999}`, http.StatusNotFound)
	esperar(t, http.MethodPut, fmt.Sprintf("/v1/documento_contrato/%d", documento), `{"EntidadTipo":"contratista"}`, http.StatusBadRequest)
}

// Un estado de contrato para un contrato que no existe no deja nada a medias.
func TestEstadoContratoSinContrato(t *testing.T) {
	conectar(t)
	esperar(t, http.MethodPost, "/v1/estado_contrato", `{"ContratoGeneralId":{"Id":999999},"UsuarioId":1}`, http.StatusBadRequest)
}

// AddEstadoContrato (generada por bee) inserta sin tocar la marca Actual de
// los demás estados; el API usa AddEstadoContratoActual.
func TestAddEstadoContratoDeBee(t *testing.T) {
	conectar(t)
	contrato := crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1}`)
	id, err := models.AddEstadoContrato(&models.EstadoContrato{ContratoGeneralId: &models.ContratoGeneral{Id: contrato}, UsuarioId: 1, Activo: true})
	if err != nil || id == 0 {
		t.Fatalf("AddEstadoContrato: %d %v", id, err)
	}
}

func esperar(t *testing.T, metodo, ruta, cuerpo string, codigo int) {
	t.Helper()
	if c, r := solicitar(t, metodo, ruta, cuerpo); c != codigo {
		t.Fatalf("%s %s: se esperaba %d, llegó %d %s %s", metodo, ruta, codigo, c, r.Message, r.Data)
	}
}
