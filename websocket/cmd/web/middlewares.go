package main

import (
	"context"
	"net/http"

	"poker/websocket/pkg/auth"
)

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement authentication middleware

		wsAuthToken := "token" // strings.Split(r.Header.Get("Sec-WebSocket-Protocol"), ", ")[1]

		authorized := wsAuthToken != ""

		if !authorized {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
			return
		}

		ctx := context.WithValue(r.Context(), "user", auth.AuthToken{
			ID:     "1",
			Name:   "John Doe",
			RoomID: "1",
		})

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
