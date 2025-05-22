package main

import (
	"fmt"
	"net/http"

	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

const (
	PORT = 8080
)

func main() {
	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	go handlers.ListenWsEvents()
	http.ListenAndServe(fmt.Sprintf(":%d", PORT), registerRoutes(router))
}
