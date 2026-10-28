package tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/beego/beego/v2/client/orm"
	_ "github.com/lib/pq"
)

// Prueba de punta a punta contra PostgreSQL con las tablas de
// database/gestion_contractual.sql. Solo corre con GESTION_CONTRACTUAL_CRUD_RUN_INTEGRATION=true
// y las variables GESTION_CONTRACTUAL_CRUD_PG* de .env.example.
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

// crear hace POST y devuelve el Id del registro creado.
func crear(t *testing.T, ruta, cuerpo string) int {
	t.Helper()
	codigo, r := solicitar(t, http.MethodPost, ruta, cuerpo)
	if codigo != http.StatusCreated {
		t.Fatalf("POST %s: %d %s %s", ruta, codigo, r.Message, r.Data)
	}
	var d struct{ Id int }
	_ = json.Unmarshal(r.Data, &d)
	return d.Id
}

func TestFlujoContratoPolizaEstados(t *testing.T) {
	conectar(t)
	numero := fmt.Sprintf("IT-%d", time.Now().UnixNano())

	contrato := crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1,"NumeroContrato":"`+numero+`","VigenciaId":2026,"FechaSuscripcion":"2026-03-01T00:00:00Z","ValorPesos":1500000.5}`)

	// Sin número de contrato se guarda NULL: varios contratos sin suscribir no chocan con el UNIQUE.
	crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1,"VigenciaId":2026}`)
	crear(t, "/v1/contrato_general", `{"UnidadEjecutoraId":1,"VigenciaId":2026}`)

	// numero_contrato + vigencia_id son únicos.
	if codigo, _ := solicitar(t, http.MethodPost, "/v1/contrato_general", `{"UnidadEjecutoraId":1,"NumeroContrato":"`+numero+`","VigenciaId":2026}`); codigo != http.StatusBadRequest {
		t.Fatalf("duplicado: se esperaba 400, llegó %d", codigo)
	}

	// PUT solo cambia lo enviado.
	codigo, r := solicitar(t, http.MethodPut, fmt.Sprintf("/v1/contrato_general/%d", contrato), `{"Objeto":"Objeto nuevo"}`)
	var actualizado struct {
		Objeto, NumeroContrato *string
		FechaSuscripcion       *time.Time
		Activo                 bool
	}
	_ = json.Unmarshal(r.Data, &actualizado)
	if codigo != http.StatusOK || *actualizado.Objeto != "Objeto nuevo" || *actualizado.NumeroContrato != numero || actualizado.FechaSuscripcion == nil || !actualizado.Activo {
		t.Fatalf("actualizar: %d %s", codigo, r.Data)
	}

	// PUT no permite cambiar el Id del registro.
	if codigo, _ := solicitar(t, http.MethodPut, fmt.Sprintf("/v1/contrato_general/%d", contrato), `{"Id":999999,"Objeto":"Otro"}`); codigo != http.StatusBadRequest {
		t.Fatalf("PUT con otro Id: se esperaba 400, llegó %d", codigo)
	}

	// Relación con un contrato que no existe.
	if codigo, _ := solicitar(t, http.MethodPost, "/v1/poliza", `{"ContratoGeneralId":{"Id":999999}}`); codigo != http.StatusBadRequest {
		t.Fatalf("póliza con contrato inexistente: se esperaba 400, llegó %d", codigo)
	}

	poliza := crear(t, "/v1/poliza", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"NumeroPoliza":"P-1","FechaInicio":"2026-03-01T00:00:00Z"}`, contrato))
	crear(t, "/v1/amparo_poliza", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"AmparoId":1}`, contrato))
	crear(t, "/v1/amparo_poliza", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"PolizaId":{"Id":%d},"AmparoId":2}`, contrato, poliza))
	crear(t, "/v1/estado_poliza", fmt.Sprintf(`{"PolizaId":{"Id":%d},"EstadoParametroId":5,"UsuarioId":1}`, poliza))
	crear(t, "/v1/estado_poliza", fmt.Sprintf(`{"PolizaId":{"Id":%d},"EstadoParametroId":6,"UsuarioId":1}`, poliza))

	// Estado vigente de la póliza: el más reciente.
	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("/v1/estado_poliza?query=PolizaId.Id:%d&sortby=FechaCreacion,Id&order=desc&limit=1", poliza), "")
	var estadosPoliza []struct{ EstadoParametroId int }
	_ = json.Unmarshal(r.Data, &estadosPoliza)
	if codigo != http.StatusOK || len(estadosPoliza) != 1 || estadosPoliza[0].EstadoParametroId != 6 {
		t.Fatalf("estado vigente: %d %s", codigo, r.Data)
	}

	// Amparos de la póliza (el otro amparo aún no tiene póliza).
	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("/v1/amparo_poliza?query=PolizaId.Id:%d", poliza), "")
	var amparos []interface{}
	_ = json.Unmarshal(r.Data, &amparos)
	if codigo != http.StatusOK || len(amparos) != 1 {
		t.Fatalf("amparos de la póliza: %d %s", codigo, r.Data)
	}

	// Estado del contrato: el nuevo queda como actual y el anterior deja de serlo.
	crear(t, "/v1/estado_contrato", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"EstadoParametroId":1,"UsuarioId":1}`, contrato))
	crear(t, "/v1/estado_contrato", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"EstadoParametroId":2,"UsuarioId":1}`, contrato))
	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("/v1/estado_contrato?query=ContratoGeneralId.Id:%d,Actual:true", contrato), "")
	var actuales []struct{ EstadoParametroId int }
	_ = json.Unmarshal(r.Data, &actuales)
	if codigo != http.StatusOK || len(actuales) != 1 || actuales[0].EstadoParametroId != 2 {
		t.Fatalf("estado actual: %d %s", codigo, r.Data)
	}

	// Documento polimórfico: la entidad debe existir.
	crear(t, "/v1/documento_contrato", fmt.Sprintf(`{"EntidadTipo":"poliza","EntidadId":%d}`, poliza))
	if codigo, _ := solicitar(t, http.MethodPost, "/v1/documento_contrato", `{"EntidadTipo":"acta_inicio","EntidadId":999999}`); codigo != http.StatusNotFound {
		t.Fatalf("documento de acta inexistente: se esperaba 404, llegó %d", codigo)
	}

	// Contrato de arrendamiento: uno por contrato.
	cuerpo := fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"ValorArrendamiento":100}`, contrato)
	crear(t, "/v1/contrato_arrendamiento", cuerpo)
	if codigo, _ := solicitar(t, http.MethodPost, "/v1/contrato_arrendamiento", cuerpo); codigo != http.StatusBadRequest {
		t.Fatalf("segundo arrendamiento: se esperaba 400, llegó %d", codigo)
	}

	// CDP y RP.
	cdp := crear(t, "/v1/disponibilidad_presupuestal", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"NumeroCdpId":10,"VigenciaCdpId":2026}`, contrato))
	crear(t, "/v1/registro_presupuestal", fmt.Sprintf(`{"DisponibilidadPresupuestalId":{"Id":%d},"NumeroRegistroPresupuestal":20}`, cdp))

	// Borrado lógico.
	if codigo, _ := solicitar(t, http.MethodDelete, fmt.Sprintf("/v1/poliza/%d", poliza), ""); codigo != http.StatusOK {
		t.Fatalf("eliminar póliza: %d", codigo)
	}
	codigo, r = solicitar(t, http.MethodGet, fmt.Sprintf("/v1/poliza/%d", poliza), "")
	var p struct{ Activo bool }
	_ = json.Unmarshal(r.Data, &p)
	if codigo != http.StatusOK || p.Activo {
		t.Fatalf("la póliza debe seguir existiendo con Activo = false: %d %s", codigo, r.Data)
	}
	if codigo, _ := solicitar(t, http.MethodGet, "/v1/poliza/999999", ""); codigo != http.StatusNotFound {
		t.Fatalf("póliza inexistente: se esperaba 404, llegó %d", codigo)
	}
}
