package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	supa "github.com/nedpals/supabase-go"
	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
)

var ROLES = [3]string{"admin", "client", "taxi"}

type Server struct {
	subscriberMessageBuffer int

	publishLimiter *rate.Limiter

	logf func(f string, v ...interface{})

	serveMux    http.ServeMux
	supabaseCli *supa.Client

	connectionsMu sync.Mutex
	connections   map[*websocket.Conn]uuid.UUID
	entryCha      chan string

	taxiSubs   map[uuid.UUID]*Subscriber
	clientSubs map[uuid.UUID]*Subscriber

	taxiPositions map[uuid.UUID]Location
}

type Subscriber struct {
	id        uuid.UUID
	msgs      chan string
	closeSlow func()
	protocol  string
	position  Location
	conn      *websocket.Conn
}

type Location struct {
	Lat float64
	Lon float64
}

func (loc Location) String() string {
	return fmt.Sprintf("%f,%f", loc.Lat, loc.Lon)
}

func parseLocation(location string) (Location, error) {
	pair := strings.Split(location, ",")
	if len(pair) != 2 {
		return Location{}, fmt.Errorf("invalid location format")
	}
	latitude, err := strconv.ParseFloat(strings.TrimSpace(pair[0]), 64)
	if err != nil {
		return Location{}, fmt.Errorf("invalid latitude: %v", err)
	}
	longitude, err := strconv.ParseFloat(strings.TrimSpace(pair[1]), 64)
	if err != nil {
		return Location{}, fmt.Errorf("invalid longitude: %v", err)
	}
	return Location{Lat: latitude, Lon: longitude}, nil
}

func (s *Server) initSupabaseCli() {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	s.supabaseCli = supa.CreateClient(supabaseUrl, supabaseKey)
}

func newServer() *Server {
	s := &Server{
		subscriberMessageBuffer: 16,
		logf:                    log.Printf,
		connections:             make(map[*websocket.Conn]uuid.UUID),
		publishLimiter:          rate.NewLimiter(rate.Every(time.Millisecond*100), 8),
		entryCha:                make(chan string),

		taxiSubs:   make(map[uuid.UUID]*Subscriber),
		clientSubs: make(map[uuid.UUID]*Subscriber),

		taxiPositions: make(map[uuid.UUID]Location),
	}

	s.initSupabaseCli()
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
	querys := r.URL.Query()
	latQ, lonQ, idQ := querys.Get("lat"), querys.Get("lon"), querys.Get("id")

	lat, err := strconv.ParseFloat(latQ, 64)
	if err != nil {
		server.logf("invalid latitude: %v", err)
		return
	}

	lon, err := strconv.ParseFloat(lonQ, 64)
	if err != nil {
		server.logf("invalid longitude: %v", err)
		return
	}

	id, err := uuid.Parse(idQ)
	if err != nil {
		server.logf("invalid UUID: %v", err)
		return
	}

	coord := Location{
		Lat: lat,
		Lon: lon,
	}

	ws, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		Subprotocols: []string{"map-admin", "map-client", "map-taxi"},
	})
	if err != nil {
		server.logf("%v", err)
		return
	}

	defer func() {
		ws.Close(websocket.StatusInternalError, "the sky is falling")
		server.deleteSubById(id)
	}()

	protocol := ws.Subprotocol()
	fmt.Printf("adding sub with protocols: %v and id: %v\n ", protocol, id.String())

	server.connectionsMu.Lock()
	server.connections[ws] = id
	sub := &Subscriber{
		msgs:      make(chan string, server.subscriberMessageBuffer),
		closeSlow: func() { ws.Close(websocket.StatusPolicyViolation, "slow subscriber") },
		protocol:  protocol,
		id:        id,
		conn:      ws,
		position:  coord,
	}
	if protocol == "map-admin" {
		server.logf("Wow, you are an admin, but this is not implemented yet")
	} else if protocol == "map-taxi" {
		server.taxiSubs[id] = sub
	} else {
		server.clientSubs[id] = sub
	}
	server.connectionsMu.Unlock()

	l := rate.NewLimiter(rate.Every(time.Millisecond*100), 10)
	for {
		select {
		case <-r.Context().Done():
			return
		default:
			err = subReader(r.Context(), server, ws, l, id)
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

func (server *Server) deleteSubById(id uuid.UUID) {
	server.connectionsMu.Lock()
	defer server.connectionsMu.Unlock()

	for ws, sub := range server.connections {
		if id == sub {
			protocol := ws.Subprotocol()
			if protocol == "map-taxi" {
				delete(server.taxiSubs, id)
				delete(server.taxiPositions, id)
			}
			if protocol == "map-client" {
				delete(server.clientSubs, id)
			}
			if protocol == "map-admin" {
				server.logf("Wow, you are an admin, but this is not implemented yet")
			}
			delete(server.connections, ws)
			return
		}
	}
}

func subReader(ctx context.Context, server *Server, ws *websocket.Conn, l *rate.Limiter, id uuid.UUID) error {
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
	msgString := string(msg)

	protocols := ws.Subprotocol()
	if strings.HasPrefix(msgString, "pos") {
		newPosition := strings.Split(msgString, "-")[1]
		fmt.Printf("Position recieved: %s \n", newPosition)
		server.connectionsMu.Lock()
		loc, err := parseLocation(newPosition)
		if err != nil {
			return fmt.Errorf("failed to parse location: %v", err)
		}
		if protocols == "map-taxi" {
			server.taxiPositions[id] = loc
		}
		server.connectionsMu.Unlock()
	}

	server.entryCha <- msgString

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
		server.connectionsMu.Lock()

		if len(server.taxiPositions) != 0 {
			var taxiPositionSlice []string
			for id, position := range server.taxiPositions {
				posAndId := position.String() + "&" + id.String()
				taxiPositionSlice = append(taxiPositionSlice, posAndId)
			}
			taxiPositionString := strings.Join(taxiPositionSlice, "$")
			for _, sub := range server.clientSubs {
				err := sub.conn.Write(context.Background(), websocket.MessageText, []byte(taxiPositionString))
				if err != nil {
					server.logf("failed to send taxi positions to client connection: %v", err)
				}
			}
		}

		server.connectionsMu.Unlock()
	}
}
