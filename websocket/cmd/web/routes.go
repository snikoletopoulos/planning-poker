package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func registerRoutes(router *chi.Mux) *chi.Mux {
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World!"))
	})

	return router
}
