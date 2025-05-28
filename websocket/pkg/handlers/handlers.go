package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"poker/websocket/pkg/auth"
	"github.com/gorilla/websocket"
)

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

type UserVoteBody struct {
	MemberID string `json:"memberId" validate:"required"`
	StoryID  string `json:"storyId" validate:"required"`
	Vote     *int   `json:"vote" validate:"required"`
}

type SelfVoteWsPayload struct {
	Action   string `json:"action" validate:"required"`
	MemberID string `json:"memberId" validate:"required"`
	StoryID  string `json:"storyId" validate:"required"`
	Vote     *int    `json:"vote" validate:"required"`
}

type MemberVoteWsPayload struct {
	Action   string `json:"action" validate:"required"`
	MemberID string `json:"memberId" validate:"required"`
	StoryID  string `json:"storyId" validate:"required"`
}

func UserVoted(w http.ResponseWriter, r *http.Request) {
	var body UserVoteBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid request body"))
		return
	}
	w.WriteHeader(http.StatusOK)

	user, ok := r.Context().Value("user").(auth.AuthToken)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error fetching user"))
		return
	}

	roomClients := wsClients[user.RoomID]
	for _, client := range roomClients {
		if client.UserID == user.ID {
			client.Conn.WriteJSON(SelfVoteWsPayload{
				Action:   "self_voted",
				MemberID: body.MemberID,
				StoryID:  body.StoryID,
				Vote:     body.Vote,
			})
		}
	}

	broadcastEvent(user.RoomID, MemberVoteWsPayload{
		Action:   "user_voted",
		MemberID: body.MemberID,
		StoryID:  body.StoryID,
	})
}

type NewStoryBody struct {
	ID          string  `json:"id" validate:"required"`
	Title       string  `json:"title" validate:"required"`
	Description *string `json:"description" validate:"required"`
	IsCompleted *bool   `json:"isCompleted" validate:"required"`
	RoomID      string  `json:"roomId" validate:"required"`
	CreatedAt   string  `json:"createdAt" validate:"required"`
}

type NewStoryWsPayload struct {
	Action string       `json:"action" validate:"required"`
	Story  NewStoryBody `json:"story" validate:"required"`
}

func NewStory(w http.ResponseWriter, r *http.Request) {
	var story NewStoryBody
	json.NewDecoder(r.Body).Decode(&story)
	broadcastEvent(story.RoomID, NewStoryWsPayload{
		Action: "new_story",
		Story:  story,
	})
}

type RevealStoryBody struct {
	StoryID string `json:"storyId" validate:"required"`
}

func RevealStory(w http.ResponseWriter, r *http.Request) {
	var body RevealStoryBody
	json.NewDecoder(r.Body).Decode(&body)
	// TODO: fetch votes
}

type Member struct {
	ID   string `json:"id" validate:"required"`
	Name string `json:"name" validate:"required"`
}

type MemberBody struct {
	RoomID string `json:"roomId" validate:"required"`
	Member Member `json:"member" validate:"required"`
}

type MemberWsPayload struct {
	Action string `json:"action" validate:"required"`
	Member Member `json:"member" validate:"required"`
}

func MemberJoined(w http.ResponseWriter, r *http.Request) {
	var body MemberBody
	json.NewDecoder(r.Body).Decode(&body)
	broadcastEvent(body.RoomID, MemberWsPayload{
		Action: "member_joined",
		Member: body.Member,
	})
}
