package main

import (
	"poker/websocket/pkg/handlers"

	"github.com/go-chi/chi/v5"
)

func registerRoutes(router *chi.Mux) *chi.Mux {
	router.Get("/", handlers.WebSocketUpgrade)
	router.Post("/vote", handlers.UserVoted)
	router.Post("/story", handlers.NewStory)
	router.Post("/reveal-story", handlers.RevealStory)
	router.Post("/join", handlers.MemberJoined)

	return router
}
