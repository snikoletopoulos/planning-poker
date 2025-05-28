package main

import (
	"fmt"
	"net/http"

	"poker/websocket/pkg/db"
	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

const (
	PORT = 3001
)

func main() {
	db.InitDB()
	go handlers.ListenWsEvents()

	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers)
	}))

	registerMiddlewares(router)
	registerRoutes(router)

	http.ListenAndServe(fmt.Sprintf(":%d", PORT), router)
}
