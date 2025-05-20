package main

import (
	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
)

func registerRoutes(router *chi.Mux) *chi.Mux {
	router.Get("/", handlers.WebSocketUpgrade)

	return router
}
