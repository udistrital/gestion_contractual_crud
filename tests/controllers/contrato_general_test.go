package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"
)

func TestContratoGeneralController(t *testing.T) {
	probarCrud(t, "/v1/contrato_general")
}

// Prueba de punta a punta contra PostgreSQL: contrato, póliza, estados,
// documento, arrendamiento, CDP y RP.
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
	if codigo, _ := solicitar(t, http.MethodPost, "/v1/documento_contrato", `{"EntidadTipo":"acta_inicio","EntidadId":999999}`); codigo != http.StatusBadRequest {
		t.Fatalf("documento de acta inexistente: se esperaba 400, llegó %d", codigo)
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

// Conteos que usa el MID para el consecutivo y el número de contrato, como en
// el CRUD en NestJS: cuentan activos e inactivos, y el de número de contrato
// cuenta cada contrato una vez aunque tenga el estado repetido o ya no sea el actual.
func TestConteosParaElMid(t *testing.T) {
	conectar(t)
	unidad := time.Now().UnixNano()%1000000000 + 1000
	contar := func(ruta, cuerpo string) int {
		t.Helper()
		codigo, r := solicitar(t, http.MethodPost, ruta, cuerpo)
		var n int
		if err := json.Unmarshal(r.Data, &n); codigo != http.StatusOK || r.Status != "200" || err != nil {
			t.Fatalf("POST %s: %d %s %s", ruta, codigo, r.Status, r.Data)
		}
		return n
	}
	consecutivo := fmt.Sprintf(`{"unidad_ejecutora_id":%d}`, unidad)
	if n := contar("/v1/contrato_general/conteo-consecutivo", consecutivo); n != 0 {
		t.Fatalf("unidad sin contratos: se esperaba 0, llegó %d", n)
	}

	uno := crear(t, "/v1/contrato_general", fmt.Sprintf(`{"UnidadEjecutoraId":%d,"VigenciaId":7001}`, unidad))
	dos := crear(t, "/v1/contrato_general", fmt.Sprintf(`{"UnidadEjecutoraId":%d,"VigenciaId":7001}`, unidad))
	crear(t, "/v1/contrato_general", fmt.Sprintf(`{"UnidadEjecutoraId":%d,"VigenciaId":7002}`, unidad))
	esperar(t, http.MethodDelete, fmt.Sprintf("/v1/contrato_general/%d", dos), "", http.StatusOK)

	// El MID llama la ruta con barra final.
	for _, ruta := range []string{"/v1/contrato_general/conteo-consecutivo", "/v1/contrato_general/conteo-consecutivo/"} {
		if n := contar(ruta, consecutivo); n != 3 {
			t.Fatalf("%s: se esperaban 3 contratos, llegó %d", ruta, n)
		}
	}

	estado := func(contrato, parametro int) {
		crear(t, "/v1/estado_contrato", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"EstadoParametroId":%d,"UsuarioId":1}`, contrato, parametro))
	}
	estado(uno, 5)
	estado(uno, 6)
	estado(uno, 5)
	estado(dos, 5)
	numero := fmt.Sprintf(`{"unidad_ejecutora_id":%d,"vigencia":7001,"estado":5}`, unidad)
	if n := contar("/v1/contrato_general/conteo-numero-contrato/", numero); n != 2 {
		t.Fatalf("conteo-numero-contrato: se esperaban 2 contratos, llegó %d", n)
	}
	if n := contar("/v1/contrato_general/conteo-numero-contrato", fmt.Sprintf(`{"unidad_ejecutora_id":%d,"vigencia":7002,"estado":5}`, unidad)); n != 0 {
		t.Fatalf("vigencia sin contratos en ese estado: se esperaba 0, llegó %d", n)
	}
}

// GET / devuelve Metadata como el CRUD en NestJS: total de registros que cumplen
// query (sin limit ni offset) y la paginación que usa el paginador del MF.
func TestMetadataDelGetAll(t *testing.T) {
	conectar(t)
	unidad := time.Now().UnixNano()%1000000000 + 1000
	var contratos []int
	for i := 0; i < 3; i++ {
		contratos = append(contratos, crear(t, "/v1/contrato_general", fmt.Sprintf(`{"UnidadEjecutoraId":%d}`, unidad)))
	}
	type metadata struct {
		Total, Limit, Offset, CurrentPage, TotalPages int64
		HasNextPage, HasPreviousPage                  bool
	}
	pedir := func(ruta string, filas int) metadata {
		t.Helper()
		codigo, r := solicitar(t, http.MethodGet, ruta, "")
		var lista []interface{}
		var m metadata
		_ = json.Unmarshal(r.Data, &lista)
		if err := json.Unmarshal(r.Metadata, &m); codigo != http.StatusOK || err != nil || len(lista) != filas {
			t.Fatalf("GET %s: %d %s %s", ruta, codigo, r.Data, r.Metadata)
		}
		return m
	}
	filtro := fmt.Sprintf("/v1/contrato_general?query=UnidadEjecutoraId:%d", unidad)
	if m := pedir(filtro+"&limit=2", 2); m != (metadata{3, 2, 0, 1, 2, true, false}) {
		t.Fatalf("primera página: %+v", m)
	}
	if m := pedir(filtro+"&limit=2&offset=2", 1); m != (metadata{3, 2, 2, 2, 2, false, true}) {
		t.Fatalf("segunda página: %+v", m)
	}
	if m := pedir(filtro+"&limit=0", 3); m != (metadata{3, 0, 0, 1, 1, false, false}) {
		t.Fatalf("limit=0: %+v", m)
	}
	// El total también cuenta con filtros sobre la relación.
	crear(t, "/v1/estado_contrato", fmt.Sprintf(`{"ContratoGeneralId":{"Id":%d},"EstadoParametroId":5,"UsuarioId":1}`, contratos[0]))
	if m := pedir(fmt.Sprintf("/v1/estado_contrato?query=Actual:true,ContratoGeneralId.UnidadEjecutoraId:%d", unidad), 1); m.Total != 1 {
		t.Fatalf("total con filtro sobre la relación: %+v", m)
	}
}
