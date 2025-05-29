package main

import (
	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func registerMiddlewares(router *chi.Mux) {
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"https://*", "http://*"},
		AllowedMethods: []string{"GET"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
		MaxAge:         300,
	}))
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(authMiddleware)
}

func registerRoutes(router *chi.Mux) {
	router.Get("/token", handlers.GetToken)
	router.Get("/", handlers.WebSocketUpgrade)
	router.Post("/vote", handlers.UserVoted)
	router.Post("/story", handlers.NewStory)
	router.Post("/reveal-story", handlers.RevealStory)
	router.Post("/unreveal-story", handlers.UnrevealStory)
	router.Post("/join", handlers.MemberJoined)
}
