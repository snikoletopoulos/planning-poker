package main

import (
	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func registerMiddlewares(router *chi.Mux) {
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
	router.Post("/join", handlers.MemberJoined)
}
