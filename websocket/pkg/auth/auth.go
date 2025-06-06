package auth

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwt"
)

type AuthToken struct {
	ID     string
	Name   string
	RoomID string
}

const authSecretEnvName = "AUTH_SECRET"

var ephemeralTokens = make(map[string]*AuthToken)

func ParseToken(ctx context.Context, token string) (AuthToken, error) {
	data, err := jwt.Parse([]byte(token), jwt.WithVerify(jwa.HS256, []byte(os.Getenv(authSecretEnvName))))
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

const authTokenLifetime = time.Second * 3

func CreateTempToken(authToken AuthToken) (string, error) {
	token, err := jwt.NewBuilder().
		Expiration(time.Now().Add(authTokenLifetime)).
		IssuedAt(time.Now()).
		Build()
	if err != nil {
		return "", err
	}

	signedTokenBytes, err := jwt.Sign(token, jwa.HS256, []byte(os.Getenv(authSecretEnvName)))
	if err != nil {
		return "", err
	}

	signedToken := string(signedTokenBytes)

	ephemeralTokens[signedToken] = &authToken

	go func() {
		time.Sleep(authTokenLifetime)
		delete(ephemeralTokens, signedToken)
	}()

	return signedToken, nil
}

func TradeEphemeralToken(token string) (AuthToken, error) {
	// TODO: check if token is still valid
	authToken := ephemeralTokens[token]
	if authToken == nil {
		return AuthToken{}, errors.New("token not found")
	}
	delete(ephemeralTokens, token)
	return *authToken, nil
}
