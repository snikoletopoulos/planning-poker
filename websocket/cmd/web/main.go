package main

import (
	"fmt"
	"net/http"

	"poker/websocket/pkg/db"
	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
)

const (
	PORT = 3001
)

func main() {
	setupEnvVars()

	db.InitDB()
	go handlers.ListenWsEvents()

	router := chi.NewRouter()

	registerMiddlewares(router)
	registerRoutes(router)

	http.ListenAndServe(fmt.Sprintf(":%d", PORT), router)
}
