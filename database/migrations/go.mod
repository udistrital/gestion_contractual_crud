// Módulo aparte para las migraciones de bee: el paquete main de esta carpeta no tiene func main
// (bee migrate la agrega al ejecutar) y, sin este go.mod, "go vet ./..." de la raíz fallaría.
module github.com/udistrital/gestion_contractual_crud/database/migrations

go 1.25.0

require (
	github.com/beego/beego/v2 v2.3.10
	github.com/lib/pq v1.10.9
)

require (
	github.com/hashicorp/golang-lru v1.0.2 // indirect
	github.com/shiena/ansicolor v0.0.0-20230509054315-a9deabde6e02 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
)
