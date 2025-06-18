package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"poker/websocket/pkg/auth"
	"poker/websocket/pkg/db"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/websocket"
)

var validate = validator.New(validator.WithRequiredStructEnabled())

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func GetToken(w http.ResponseWriter, r *http.Request) {
	authToken, ok := r.Context().Value("user").(auth.AuthToken)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching user"))
		return
	}

	token, err := auth.CreateTempToken(authToken)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error creating token"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(token))
}

func WebSocketUpgrade(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade to websocket connection:", err)
		return
	}

	user, ok := r.Context().Value("user").(auth.AuthToken)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching user"))
		return
	}

	client := WsConnection{
		Conn:   ws,
		RoomID: user.RoomID,
		UserID: user.ID,
	}
	wsClients[user.RoomID] = append(wsClients[user.RoomID], &client)
	go receiveWsEvent(client)
}

func UserVoted(w http.ResponseWriter, r *http.Request) {
	var body struct {
		MemberID string `json:"memberId" validate:"required"`
		StoryID  string `json:"storyId" validate:"required"`
		Vote     *int   `json:"vote" validate:"gte=0,lte=89"` // TODO: make nil pass validation
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	err = validate.Struct(body)
	if err != nil {
		fmt.Println("🪚 err:", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	user, ok := r.Context().Value("user").(auth.AuthToken)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching user"))
		return
	}

	roomClients := wsClients[user.RoomID]
	for _, client := range roomClients {
		if client.UserID == user.ID {
			client.Conn.WriteJSON(struct {
				Action   string `json:"action"`
				MemberID string `json:"memberId"`
				StoryID  string `json:"storyId"`
				Vote     *int   `json:"vote"`
			}{
				Action:   "self_voted",
				MemberID: body.MemberID,
				StoryID:  body.StoryID,
				Vote:     body.Vote,
			})
		}
	}

	broadcastEvent(user.RoomID, struct {
		Action   string `json:"action"`
		MemberID string `json:"memberId"`
		StoryID  string `json:"storyId"`
	}{
		Action:   "user_voted",
		MemberID: body.MemberID,
		StoryID:  body.StoryID,
	})
}

type Story struct {
	ID          string  `json:"id" validate:"required"`
	Title       string  `json:"title" validate:"required,min=1"`
	Description *string `json:"description" validate:"required"`
	IsCompleted *bool   `json:"isCompleted" validate:"required"`
	RoomID      string  `json:"roomId" validate:"required"`
	CreatedAt   string  `json:"createdAt" validate:"required,datetime"` // TODO: datetime
}

func NewStory(w http.ResponseWriter, r *http.Request) {
	var story Story
	err := json.NewDecoder(r.Body).Decode(&story)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	err = validate.Struct(story)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	broadcastEvent(story.RoomID, struct {
		Action string `json:"action"`
		Story  Story  `json:"story"`
	}{
		Action: "new_story",
		Story:  story,
	})
}

func RevealStory(w http.ResponseWriter, r *http.Request) {
	var body struct {
		StoryID string `json:"storyId"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	err = validate.Struct(body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	votes, err := db.GetStoryVotes(body.StoryID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching votes"))
		return
	}

	user, ok := r.Context().Value("user").(auth.AuthToken)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching user"))
		return
	}

	broadcastEvent(user.RoomID, struct {
		Action  string    `json:"action"`
		StoryID string    `json:"storyId"`
		Votes   []db.Vote `json:"votes"`
	}{
		Action:  "reveal_story",
		StoryID: body.StoryID,
		Votes:   votes,
	})
}

func UnrevealStory(w http.ResponseWriter, r *http.Request) {
	var body struct {
		StoryID string `json:"storyId" validate:"required"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	err = validate.Struct(body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	user, ok := r.Context().Value("user").(auth.AuthToken)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching user"))
		return
	}

	broadcastEvent(user.RoomID, struct {
		Action  string `json:"action"`
		StoryID string `json:"storyId"`
	}{
		Action:  "unreveal_story",
		StoryID: body.StoryID,
	})
}

type Member struct {
	ID   string `json:"id" validate:"required"`
	Name string `json:"name" validate:"required,min=1"`
}

func MemberJoined(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RoomID string `json:"roomId" validate:"required"`
		Member Member `json:"member" validate:"required"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	err = validate.Struct(body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}

	broadcastEvent(body.RoomID, struct {
		Action string `json:"action"`
		Member Member `json:"member"`
	}{
		Action: "member_joined",
		Member: body.Member,
	})
}
