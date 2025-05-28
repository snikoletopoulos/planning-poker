package main

import (
	"context"
	"net/http"
	"strings"

	"poker/websocket/pkg/auth"
)

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var authToken auth.AuthToken

		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			authHeaderSplit := strings.Split(authHeader, " ")
			if len(authHeaderSplit) < 2 {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized"))
				return
			}

			token := authHeaderSplit[1]
			var err error
			authToken, err = auth.ParseToken(r.Context(), token)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized"))
				return
			}
		}

		tempToken := r.URL.Query().Get("token")
		if tempToken != "" {
			var err error
			authToken, err = auth.TradeEphemeralToken(tempToken)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Invalid token"))
				return
			}
		}

		if authToken.ID == "" {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
			return
		}

		ctx := context.WithValue(r.Context(), "user", authToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
