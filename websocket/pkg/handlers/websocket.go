package handlers

import (
	"log"

	"github.com/gorilla/websocket"
)

var (
	wsClients = make(map[string][]*WsConnection)
	wsChan    = make(chan WsPayload)
)

type WsConnection struct {
	Conn   *websocket.Conn
	RoomID string
	UserID string
}

type WsPayload struct {
	Client WsConnection
	Action string `json:"action"`
}

func receiveWsEvent(client WsConnection) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("Error", r)
		}
	}()

	for {
		var message WsPayload
		if err := client.Conn.ReadJSON(&message); err != nil {
			log.Println("Error reading from websocket:", err)
			client.Conn.Close()
			deleteWsClient(&client)
			return
		}
		message.Client = client
		wsChan <- message
	}
}

func ListenWsEvents() {
	for {
		event := <-wsChan

		switch event.Action {
		case "next_story":
			type NextStoryData struct {
				Action string `json:"action"`
			}
			broadcastEvent(event.Client.RoomID, NextStoryData{Action: "next_story"})
		case "leave":
			deleteWsClient(&event.Client)
		}
	}
}

func broadcastEvent(roomID string, data any) {
	var clientsToRemove []*WsConnection
	for _, client := range wsClients[roomID] {
		if err := client.Conn.WriteJSON(data); err != nil {
			log.Println("Error writing to websocket:", err)
			client.Conn.Close()
			clientsToRemove = append(clientsToRemove, client)
		}
	}

	for _, client := range clientsToRemove {
		deleteWsClient(client)
	}
}

func deleteWsClient(client *WsConnection) {
	roomID := client.RoomID

	var index int
	itemFound := false
	for i, conn := range wsClients[roomID] {
		if client == conn {
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
