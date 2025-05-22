package handlers

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

var (
	wsClients = make(map[string][]*websocket.Conn)
	wsChan    = make(chan WsPayload)
)

type WsPayload struct {
	Action string
	Data   any
	Conn   *websocket.Conn
	RoomID string
}

func receiveWsEvent(ws *websocket.Conn, roomID string) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("Error", r)
		}
	}()

	for {
		var message any
		if err := ws.ReadJSON(&message); err != nil {
			log.Println("Error reading from websocket:", err)
			ws.Close()
			deleteWsClient(roomID, ws)
			return
		}

		wsChan <- WsPayload{Action: "next_story", Data: nil, Conn: ws, RoomID: roomID}
	}
}

func ListenWsEvents() {
	for {
		event := <-wsChan
		fmt.Println("🪚 event:", event)

		switch event.Action {
		case "next_story":
			type NextStoryData struct {
				Action string `json:"action"`
			}
			broadcastEvent(event.RoomID, NextStoryData{Action: "next_story"})

		case "leave":
			deleteWsClient(event.RoomID, event.Conn)
		}
	}
}

func broadcastEvent(roomID string, data any) {
	var clientsToRemove []*websocket.Conn
	for _, ws := range wsClients[roomID] {
		if err := ws.WriteJSON(data); err != nil {
			log.Println("Error writing to websocket:", err)
			ws.Close()
			clientsToRemove = append(clientsToRemove, ws)
		}
	}

	for _, ws := range clientsToRemove {
		deleteWsClient(roomID, ws)
	}
}

func deleteWsClient(roomID string, ws *websocket.Conn) {
	var index int
	itemFound := false
	for i, client := range wsClients[roomID] {
		if client == ws {
			index = i
			itemFound = true
			break
		}
	}

	if !itemFound {
		return
	}

	wsClients[roomID][index] = wsClients[roomID][len(wsClients[roomID])-1]
	wsClients[roomID] = wsClients[roomID][:len(wsClients[roomID])-1]
}
