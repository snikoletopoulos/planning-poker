package main

import (
	"context"
	"net/http"
	"strings"

	"poker/websocket/pkg/auth"
)

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var token string

		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			authHeaderSplit := strings.Split(authHeader, " ")
			if len(authHeaderSplit) < 2 {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized"))
				return
			}
			token = authHeaderSplit[1]
		}

		// TODO: get token from ws handshake

		authorized := false

		var authToken auth.AuthToken
		if token != "" {
			var err error
			authToken, err = auth.ParseToken(r.Context(), token)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized"))
				return
			}
			authorized = true
		}

		if !authorized {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
			return
		}

		ctx := context.WithValue(r.Context(), "user", authToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
