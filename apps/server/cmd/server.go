package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
)

var ROLES = [3]string{"admin", "client", "taxi"}

type Server struct {
	subscriberMessageBuffer int

	publishLimiter *rate.Limiter

	logf func(f string, v ...interface{})

	serveMux http.ServeMux

	subscribersMu sync.Mutex
	subscribers   map[*Subscriber]struct{}
	connections   map[*websocket.Conn]*Subscriber
	entryCha      chan string
}

type Subscriber struct {
	msgs      chan string
	closeSlow func()
	protocol  string
	position  string
	id        uuid.UUID
}

// newChatServer constructs a chatServer with the defaults.
func newServer() *Server {
	s := &Server{
		subscriberMessageBuffer: 16,
		logf:                    log.Printf,
		subscribers:             make(map[*Subscriber]struct{}),
		connections:             make(map[*websocket.Conn]*Subscriber),
		publishLimiter:          rate.NewLimiter(rate.Every(time.Millisecond*100), 8),
		entryCha:                make(chan string),
	}
	s.serveMux.Handle("/", http.FileServer(http.Dir("./assets")))
	s.serveMux.HandleFunc("/subscribe", s.subscribeHandler)

	go s.broadcastTaxis()
	go s.printSubsReads()

	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.serveMux.ServeHTTP(w, r)
}

func (server *Server) subscribeHandler(w http.ResponseWriter, r *http.Request) {
	ws, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		Subprotocols: []string{"map-admin", "map-client", "map-taxi"},
	})
	if err != nil {
		server.logf("%v", err)
		return
	}

	protocol := ws.Subprotocol()
	fmt.Println("adding sub with protocol: ", protocol)

	server.subscribersMu.Lock()
	sub := &Subscriber{
		msgs:      make(chan string, server.subscriberMessageBuffer),
		closeSlow: func() { ws.Close(websocket.StatusPolicyViolation, "slow subscriber") },
		protocol:  protocol,
	}
	server.connections[ws] = sub
	server.subscribers[sub] = struct{}{}
	server.subscribersMu.Unlock()

	defer func() {
		ws.Close(websocket.StatusInternalError, "the sky is falling")
		server.deleteSubscriber(sub)
	}()

	l := rate.NewLimiter(rate.Every(time.Millisecond*100), 10)
	for {
		select {
		case <-r.Context().Done():
			return
		default:
			err = subReader(r.Context(), ws, l, server.entryCha, sub)
			if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
				return
			}
			if err != nil {
				server.logf("failed to echo with %v: %v", r.RemoteAddr, err)
				return
			}
		}
	}
}

func (server *Server) deleteSubscriber(s *Subscriber) {
	server.subscribersMu.Lock()
	defer server.subscribersMu.Unlock()

	delete(server.subscribers, s)

	for ws, sub := range server.connections {
		if s == sub {
			delete(server.connections, ws)
			return
		}
	}
}

func (server *Server) deleteConnection(w *websocket.Conn) {
	server.subscribersMu.Lock()
	defer server.subscribersMu.Unlock()

	for ws, sub := range server.connections {
		if ws == w {
			delete(server.subscribers, sub)
			return
		}
	}
	delete(server.connections, w)
}

func subReader(ctx context.Context, ws *websocket.Conn, l *rate.Limiter, entryCha chan string, sub *Subscriber) error {
	err := l.Wait(ctx)
	if err != nil {
		return err
	}

	_, r, err := ws.Reader(ctx)
	if err != nil {
		return err
	}

	msg, err := io.ReadAll(r)
	if err != nil {
		return fmt.Errorf("failed to read message: %w", err)
	}
	// convert msg to string
	msgString := string(msg)

	if strings.HasPrefix(msgString, "pos") {
		substring := strings.Split(msgString, "-")
		fmt.Printf("Position recieved: %s \n", substring[1])
		sub.position = substring[1]
	} else if strings.HasPrefix(msgString, "id") {
		substring := strings.Split(msgString, "|")
		id, err := uuid.Parse(substring[1])
		fmt.Printf("Id recieved: %s \n", id.String())
		sub.id = id
		if err != nil {
			return fmt.Errorf("failed to parse id: %w", err)
		}
	}

	// Send the message to the entryCha channel
	entryCha <- msgString

	//err = c.Close(websocket.StatusNormalClosure, "")
	return err
}

func (server *Server) printSubsReads() {
	for {
		msg := <-server.entryCha
		fmt.Println("Recieved string: ", msg)
	}
}

func (server *Server) broadcastTaxis() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		server.subscribersMu.Lock()
		if len(server.subscribers) > 0 {
			var positionSlice []string
			for sub := range server.subscribers {
				if sub.position != "" && sub.id != uuid.Nil {
					posAndId := sub.position + "-" + sub.id.String()
					positionSlice = append(positionSlice, posAndId)
				}
			}
			positionString := strings.Join(positionSlice, ",")
			fmt.Printf("len: %d, locations: %s \n", len(positionSlice), positionString)
			if len(positionSlice) != 0 {
				for ws := range server.connections {
					err := ws.Write(context.Background(), websocket.MessageText, []byte(positionString))
					if err != nil {
						server.logf("failed to send last position to connection: %v", err)
						// server.deleteConnection(ws)
					}
				}
			}
		}
		server.subscribersMu.Unlock()
	}
}
