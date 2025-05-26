package auth

import (
	"context"
	"fmt"

	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwt"
)

type AuthToken struct {
	ID     string
	Name   string
	RoomID string
}

const SECRET = "secret"

func ParseToken(ctx context.Context, token string) (AuthToken, error) {
	data, err := jwt.Parse([]byte(token), jwt.WithVerify(jwa.HS256, []byte(SECRET)))
	if err != nil {
		return AuthToken{}, err
	}

	userIDData, idExists := data.Get("id")
	roomIDData, roomIDExists := data.Get("roomId")
	nameData, nameExists := data.Get("name")
	if !idExists || !roomIDExists || !nameExists {
		return AuthToken{}, fmt.Errorf("invalid token")
	}

	userID, userIDOk := userIDData.(string)
	roomID, roomIDOk := roomIDData.(string)
	name, nameOk := nameData.(string)
	if !userIDOk || !roomIDOk || !nameOk {
		return AuthToken{}, fmt.Errorf("invalid token")
	}

	return AuthToken{
		ID:     userID,
		Name:   name,
		RoomID: roomID,
	}, nil
}
