package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/beego/beego/v2/client/orm"
	"github.com/beego/beego/v2/server/web"
	_ "github.com/lib/pq"
	"github.com/udistrital/utils_oas/v2/customerror"

	_ "github.com/udistrital/gestion_contractual_crud/routers"
)

// Pruebas de la capa HTTP que no necesitan base de datos: las validaciones
// responden antes de consultar o guardar.

func TestMain(m *testing.M) {
	// Lo mismo que copyrequestbody = true y autorender = false de conf/app.conf.
	web.BConfig.CopyRequestBody = true
	web.BConfig.WebConfig.AutoRender = false
	// Lo mismo que main.go: los errores los responde customerror de utils_oas.
	web.ErrorController(&customerror.CustomErrorController{})
	os.Exit(m.Run())
}

type respuesta struct {
	Success  bool
	Status   string
	Message  string
	Data     json.RawMessage
	Metadata json.RawMessage
}

func solicitar(t *testing.T, metodo, ruta, cuerpo string) (int, respuesta) {
	t.Helper()
	req := httptest.NewRequest(metodo, ruta, bytes.NewReader([]byte(cuerpo)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	web.BeeApp.Handlers.ServeHTTP(rec, req)
	var r respuesta
	_ = json.Unmarshal(rec.Body.Bytes(), &r)
	return rec.Code, r
}

func TestIdInvalidoResponde400(t *testing.T) {
	for _, ruta := range []string{"/v1/poliza/abc", "/v1/contrato_general/0", "/v1/acta_inicio/-3"} {
		codigo, r := solicitar(t, http.MethodGet, ruta, "")
		if codigo != http.StatusBadRequest || r.Success || r.Status != "400" {
			t.Fatalf("%s: se esperaba 400, llegó %d %+v", ruta, codigo, r)
		}
	}
}

func TestCuerpoNoEsJSON(t *testing.T) {
	codigo, r := solicitar(t, http.MethodPost, "/v1/convenio", `{"contrato_general_id":`)
	if codigo != http.StatusBadRequest || r.Message != "Error service POST: The request contains an incorrect data type or an invalid parameter" {
		t.Fatalf("se esperaba 400, llegó %d %+v", codigo, r)
	}
}

func TestTipoInvalido(t *testing.T) {
	codigo, _ := solicitar(t, http.MethodPost, "/v1/contrato_general", `{"unidad_ejecutora_id":"uno"}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestCampoObligatorio(t *testing.T) {
	codigo, r := solicitar(t, http.MethodPost, "/v1/poliza", `{"numero_poliza":"P-1"}`)
	var errores []string
	_ = json.Unmarshal(r.Data, &errores)
	if codigo != http.StatusBadRequest || len(errores) != 1 || errores[0] != "ContratoGeneralId es obligatorio" {
		t.Fatalf("se esperaba 400 por ContratoGeneralId, llegó %d %v", codigo, errores)
	}
}

func TestRelacionSinId(t *testing.T) {
	codigo, _ := solicitar(t, http.MethodPost, "/v1/amparo_poliza", `{"contrato_general_id":{},"amparo_id":1}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestLongitudMaxima(t *testing.T) {
	largo := string(bytes.Repeat([]byte("x"), 51))
	codigo, _ := solicitar(t, http.MethodPost, "/v1/poliza", `{"contrato_general_id":{"id":1},"numero_poliza":"`+largo+`"}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestEntidadDeDocumento(t *testing.T) {
	codigo, _ := solicitar(t, http.MethodPost, "/v1/documento_contrato", `{"entidad_tipo":"solicitante","entidad_id":1}`)
	if codigo != http.StatusBadRequest {
		t.Fatalf("se esperaba 400, llegó %d", codigo)
	}
}

func TestFechasInvertidas(t *testing.T) {
	codigo, r := solicitar(t, http.MethodPost, "/v1/poliza", `{"contrato_general_id":{"id":1},"fecha_inicio":"2026-12-31T00:00:00Z","fecha_fin":"2026-01-01T00:00:00Z"}`)
	var errores []string
	_ = json.Unmarshal(r.Data, &errores)
	if codigo != http.StatusBadRequest || len(errores) != 1 || errores[0] != "La fecha de inicio debe ser menor a la fecha de fin" {
		t.Fatalf("se esperaba 400 por las fechas, llegó %d %s", codigo, r.Data)
	}
}

func TestConteosSinDatos(t *testing.T) {
	for _, ruta := range []string{"/v1/contrato_general/conteo-consecutivo", "/v1/contrato_general/conteo-numero-contrato"} {
		if codigo, _ := solicitar(t, http.MethodPost, ruta, `{}`); codigo != http.StatusBadRequest {
			t.Fatalf("%s sin datos: se esperaba 400, llegó %d", ruta, codigo)
		}
		if codigo, _ := solicitar(t, http.MethodPost, ruta, `{`); codigo != http.StatusBadRequest {
			t.Fatalf("%s con cuerpo inválido: se esperaba 400, llegó %d", ruta, codigo)
		}
	}
}

func TestQueryMalFormado(t *testing.T) {
	codigo, r := solicitar(t, http.MethodGet, "/v1/poliza?query=NumeroPoliza", "")
	if codigo != http.StatusBadRequest || r.Message != "Error service GetAll: The request contains an incorrect parameter or no record exists" {
		t.Fatalf("se esperaba 400, llegó %d %+v", codigo, r)
	}
}

func TestTablasRetiradasNoTienenRuta(t *testing.T) {
	for _, ruta := range []string{"/v1/contratista", "/v1/lugar_ejecucion", "/v1/solicitante"} {
		if codigo, _ := solicitar(t, http.MethodGet, ruta, ""); codigo != http.StatusNotFound {
			t.Fatalf("%s: se esperaba 404, llegó %d", ruta, codigo)
		}
	}
}

// Pruebas contra PostgreSQL con las tablas de database/gestion_contractual.sql.
// Solo corren con GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION=true
// y las variables GESTION_CONTRACTUAL_CRUD_PG* del README.
func conectar(t *testing.T) {
	t.Helper()
	if os.Getenv("GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION") != "true" {
		t.Skip("prueba de integración deshabilitada")
	}
	conn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?search_path=%s&sslmode=disable",
		os.Getenv("GESTION_CONTRACTUAL_CRUD_PGUSER"), os.Getenv("GESTION_CONTRACTUAL_CRUD_PGPASS"),
		os.Getenv("GESTION_CONTRACTUAL_CRUD_PGHOST"), os.Getenv("GESTION_CONTRACTUAL_CRUD_PGPORT"),
		os.Getenv("GESTION_CONTRACTUAL_CRUD_PGDB"), os.Getenv("GESTION_CONTRACTUAL_CRUD_PGSCHEMA"))
	if _, err := orm.GetDB("default"); err != nil {
		if err := orm.RegisterDataBase("default", "postgres", conn); err != nil {
			t.Fatal(err)
		}
	}
}

// crear hace POST y devuelve el id del registro creado. Data trae el registro
// guardado, con su id en minúscula (snake_case).
func crear(t *testing.T, ruta, cuerpo string) int {
	t.Helper()
	codigo, r := solicitar(t, http.MethodPost, ruta, cuerpo)
	if codigo != http.StatusCreated {
		t.Fatalf("POST %s: %d %s %s", ruta, codigo, r.Message, r.Data)
	}
	var d map[string]interface{}
	_ = json.Unmarshal(r.Data, &d)
	id, _ := d["id"].(float64)
	if id < 1 {
		t.Fatalf("POST %s: Data sin id: %s", ruta, r.Data)
	}
	return int(id)
}

func esperar(t *testing.T, metodo, ruta, cuerpo string, codigo int) {
	t.Helper()
	if c, r := solicitar(t, metodo, ruta, cuerpo); c != codigo {
		t.Fatalf("%s %s: se esperaba %d, llegó %d %s %s", metodo, ruta, codigo, c, r.Message, r.Data)
	}
}

// probarCrud recorre los 5 endpoints de una tabla contra PostgreSQL, con los
// casos de éxito y de error de cada uno. Lo usa el <tabla>_test.go de cada
// controlador.

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
	cg := fmt.Sprintf(`"contrato_general_id":{"id":%d}`, contrato)
	return []recurso{
		{"/v1/contrato_general", fmt.Sprintf(`{"unidad_ejecutora_id":1,"numero_contrato":"CRUD-%d","vigencia_id":2026}`, time.Now().UnixNano()),
			`{"objeto":"Nuevo objeto"}`, "objeto", "Nuevo objeto", `{"vigencia_id":2026}`, "unidad_ejecutora_id:1", "VigenciaId"},
		{"/v1/supervisor_contrato", `{` + cg + `,"sede_id":1,"dependencia_id":2}`,
			`{"cargo_legado":"Supervisor"}`, "cargo_legado", "Supervisor", `{` + cg + `,"sede_id":1}`, "sede_id:1", "DependenciaId"},
		{"/v1/ordenador_contrato", `{` + cg + `,"tercero_id":3}`,
			`{"resolucion":"R-1"}`, "resolucion", "R-1", `{"tercero_id":3}`, "tercero_id:3", "TerceroId"},
		{"/v1/estado_contrato", `{` + cg + `,"estado_parametro_id":1,"usuario_id":1}`,
			`{"motivo":"Ajuste"}`, "motivo", "Ajuste", `{` + cg + `}`, "usuario_id:1", "EstadoParametroId"},
		{"/v1/convenio", `{` + cg + `,"nombre":"Convenio"}`,
			`{"vigencia":2027}`, "vigencia", float64(2027), `{"nombre":"Sin contrato"}`, "nombre:Convenio", "Nombre"},
		{"/v1/contrato_arrendamiento", `{` + cg + `,"valor_arrendamiento":100}`,
			`{"reajuste":"IPC"}`, "reajuste", "IPC", `{"valor_arrendamiento":100}`, "valor_arrendamiento:100", "ValorArrendamiento"},
		{"/v1/especificacion_tecnica", `{` + cg + `,"cantidad":2,"valor_unitario":10}`,
			`{"cantidad":3}`, "cantidad", float64(3), `{"valor_unitario":10}`, "cantidad:2", "Cantidad"},
		{"/v1/disponibilidad_presupuestal", `{` + cg + `,"numero_cdp_id":10}`,
			`{"vigencia_cdp_id":2026}`, "vigencia_cdp_id", float64(2026), `{"numero_cdp_id":10}`, "numero_cdp_id:10", "NumeroCdpId"},
		{"/v1/registro_presupuestal", fmt.Sprintf(`{"disponibilidad_presupuestal_id":{"id":%d},"numero_registro_presupuestal":20}`, cdp),
			`{"vigencia_rp_id":2026}`, "vigencia_rp_id", float64(2026), `{"numero_registro_presupuestal":20}`, "numero_registro_presupuestal:20", "NumeroRegistroPresupuestal"},
		{"/v1/acta_inicio", `{` + cg + `,"numero_acta":"A-1"}`,
			`{"nombre_interventor":"Interventor"}`, "nombre_interventor", "Interventor", `{"numero_acta":"A-1"}`, "numero_acta:A-1", "NumeroActa"},
		{"/v1/poliza", `{` + cg + `,"numero_poliza":"P-1"}`,
			`{"descripcion":"Póliza"}`, "descripcion", "Póliza", `{"numero_poliza":"P-1"}`, "numero_poliza:P-1", "NumeroPoliza"},
		{"/v1/estado_poliza", fmt.Sprintf(`{"poliza_id":{"id":%d},"estado_parametro_id":5,"usuario_id":1}`, poliza),
			`{"motivo":"Aprobada"}`, "motivo", "Aprobada", `{"estado_parametro_id":5,"usuario_id":1}`, "estado_parametro_id:5", "EstadoParametroId"},
		{"/v1/amparo_poliza", fmt.Sprintf(`{`+cg+`,"poliza_id":{"id":%d},"amparo_id":1}`, poliza),
			`{"valor":500}`, "valor", float64(500), `{"amparo_id":1}`, "amparo_id:1", "AmparoId"},
		{"/v1/documento_contrato", fmt.Sprintf(`{"entidad_tipo":"acta_inicio","entidad_id":%d}`, acta),
			`{"documento_enlace":"enlace"}`, "documento_enlace", "enlace", `{"entidad_tipo":"otra","entidad_id":1}`, "entidad_tipo:acta_inicio", "EntidadId"},
	}
}

func probarCrud(t *testing.T, ruta string) {
	conectar(t)
	contrato := crear(t, "/v1/contrato_general", `{"unidad_ejecutora_id":1,"vigencia_id":2026}`)
	poliza := crear(t, "/v1/poliza", fmt.Sprintf(`{"contrato_general_id":{"id":%d}}`, contrato))
	cdp := crear(t, "/v1/disponibilidad_presupuestal", fmt.Sprintf(`{"contrato_general_id":{"id":%d}}`, contrato))
	acta := crear(t, "/v1/acta_inicio", fmt.Sprintf(`{"contrato_general_id":{"id":%d}}`, contrato))

	for _, rc := range recursos(contrato, poliza, cdp, acta) {
		if rc.ruta != ruta {
			continue
		}
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
		if codigo != http.StatusOK || string(r.Data) != "[]" {
			t.Fatalf("GetAll sin resultados: %d %s", codigo, r.Data)
		}

		// Put: solo cambia lo enviado.
		codigo, r = solicitar(t, http.MethodPut, uno, rc.cambio)
		var actualizado map[string]interface{}
		_ = json.Unmarshal(r.Data, &actualizado)
		if codigo != http.StatusOK || actualizado[rc.campo] != rc.valor || actualizado["id"] != float64(id) {
			t.Fatalf("p_u_t: %d %s", codigo, r.Data)
		}
		esperar(t, http.MethodPut, uno, `{"id":999999}`, http.StatusBadRequest)
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
		return
	}
	t.Fatalf("no hay datos de prueba para %s", ruta)
}
