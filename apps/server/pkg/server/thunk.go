package server

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"nhooyr.io/websocket"
)

// Server is the WebSocket echo server implementation.
// It ensures the client speaks the echo subprotocol and
// only allows one message every 100ms with a 10 message burst.
type Server struct {
	// subscriberMessageBuffer controls the max number
	// of messages that can be queued for a subscriber
	// before it is kicked.
	//
	// Defaults to 16.
	subscriberMessageBuffer int

	// publishLimiter controls the rate limit applied to the publish endpoint.
	//
	// Defaults to one publish every 100ms with a burst of 8.
	publishLimiter *rate.Limiter

	// logf controls where logs are sent.
	// Defaults to log.Printf.
	logf func(f string, v ...interface{})

	// serveMux routes the various endpoints to the appropriate handler.
	serveMux http.ServeMux

	subscribersMu sync.Mutex
	subscribers   map[*subscriber]struct{}

	connections map[*websocket.Conn]struct{}
	broadcast   chan []byte

	lastPositions map[*subscriber][]byte

	incoming chan []byte
}

func (server *Server) sendLastPositions() {
	for {
		server.subscribersMu.Lock()
		if len(server.subscribers) > 0 {
			for sub := range server.subscribers {
				if sub.lastPosition != nil {
					sub.msgs <- sub.lastPosition
				}
			}
		}
		server.subscribersMu.Unlock()
		time.Sleep(2 * time.Second)
	}
}

func (server *Server) sendLastPositions3() {
	for {
		server.subscribersMu.Lock()
		if len(server.subscribers) > 0 {
			var lastPositions [][]byte
			for sub := range server.subscribers {
				if sub.lastPosition != nil {
					lastPositions = append(lastPositions, sub.lastPosition)
				}
			}
			for conn := range server.connections {
				for _, position := range lastPositions {
					err := conn.Write(context.Background(), websocket.MessageText, position)
					if err != nil {
						server.logf("failed to send last position to connection: %v", err)
						// Remove the connection if sending fails
						delete(server.connections, conn)
					}
				}
			}
		}
		server.subscribersMu.Unlock()
		time.Sleep(2 * time.Second)
	}
}

// subscriber represents a subscriber.
// Messages are sent on the msgs channel and if the client
// cannot keep up with the messages, closeSlow is called.
type subscriber struct {
	msgs         chan []byte
	closeSlow    func()
	lastPosition []byte
}

// newChatServer constructs a chatServer with the defaults.
func newServer() *Server {
	server := &Server{
		subscriberMessageBuffer: 16,
		logf:                    log.Printf,
		subscribers:             make(map[*subscriber]struct{}),
		publishLimiter:          rate.NewLimiter(rate.Every(time.Millisecond*100), 8),

		connections: make(map[*websocket.Conn]struct{}),
		broadcast:   make(chan []byte),

		lastPositions: make(map[*subscriber][]byte),
		incoming:      make(chan []byte),
	}
	server.serveMux.Handle("/", http.FileServer(http.Dir(".")))
	server.serveMux.HandleFunc("/subscribe", server.subscribeHandler2)

	go server.broadcastMessages2()
	go server.broadcastLastMessages2()
	go server.sendLastPositions()

	return server
}

func (cs *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	cs.serveMux.ServeHTTP(w, r)
}

func (server *Server) subscribeHandler4(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		Subprotocols: []string{"map-admin", "map-client", "map-taxi"},
	})
	if err != nil {
		server.logf("%v", err)
		return
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	// Store the new connection
	server.subscribersMu.Lock()
	server.connections[c] = struct{}{}

	sub := &subscriber{
		msgs:         make(chan []byte, server.subscriberMessageBuffer),
		closeSlow:    func() { c.Close(websocket.StatusPolicyViolation, "slow subscriber") },
		lastPosition: nil,
	}
	server.subscribers[sub] = struct{}{}
	server.subscribersMu.Unlock()

	// Send the last message immediately to the connection
	if sub.lastPosition != nil {
		err := c.Write(context.Background(), websocket.MessageText, sub.lastPosition)
		if err != nil {
			server.logf("failed to send last position to connection: %v", err)
			delete(server.connections, c)
			return
		}
	}

	l := rate.NewLimiter(rate.Every(time.Millisecond*100), 10)
	for {
		select {
		case <-r.Context().Done():
			return
		default:
			err = echoTimer(r.Context(), c, l, server.broadcast, sub)
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

func (server *Server) subscribeHandler2(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		Subprotocols: []string{"map-admin", "map-client", "map-taxi"},
	})
	if err != nil {
		server.logf("%v", err)
		return
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	// Store the new connection
	server.subscribersMu.Lock()
	server.connections[c] = struct{}{}

	sub := &subscriber{
		msgs:         make(chan []byte, server.subscriberMessageBuffer),
		closeSlow:    func() { c.Close(websocket.StatusPolicyViolation, "slow subscriber") },
		lastPosition: nil,
	}
	server.subscribers[sub] = struct{}{}
	server.subscribersMu.Unlock()

	l := rate.NewLimiter(rate.Every(time.Millisecond*100), 10)
	for {
		select {
		case <-r.Context().Done():
			return
		default:
			err = echoTimer2(r.Context(), c, l, server.incoming)
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

func (server *Server) subscribeHandler(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		Subprotocols: []string{"map-admin", "map-client", "map-taxi"},
	})
	if err != nil {
		server.logf("%v", err)
		return
	}
	defer c.Close(websocket.StatusInternalError, "the sky is falling")

	// Store the new connection
	server.subscribersMu.Lock()
	server.connections[c] = struct{}{}
	sub := &subscriber{
		msgs:         make(chan []byte, server.subscriberMessageBuffer),
		closeSlow:    func() { c.Close(websocket.StatusPolicyViolation, "slow subscriber") },
		lastPosition: nil,
	}
	server.subscribers[sub] = struct{}{}
	server.subscribersMu.Unlock()

	protocol := strings.ToLower(c.Subprotocol())
	// strings.Contains(protocol, "map")
	// strings.HasPrefix(protocol, "map")

	if protocol != "map-admin" && protocol != "map-client" && protocol != "map-taxi" {
		c.Close(websocket.StatusPolicyViolation, "client must speak a map subprotocol")
		return
	}

	l := rate.NewLimiter(rate.Every(time.Millisecond*100), 10)
	for {
		err = echoTimer(r.Context(), c, l, server.broadcast, sub)
		// err = echoMult(r.Context(), c, l, server.broadcast)
		// err = echo(r.Context(), c, l)
		if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
			return
		}
		if err != nil {
			server.logf("failed to echo with %v: %v", r.RemoteAddr, err)
			return
		}
	}
}

func (server *Server) broadcastLastMessages2() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		server.subscribersMu.Lock()
		if len(server.subscribers) > 0 {
			for _, lastPos := range server.lastPositions {
				if lastPos != nil {
					server.broadcast <- lastPos
				}
			}
		}
		server.subscribersMu.Unlock()
	}
}
func (server *Server) broadcastLastMessages() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		server.subscribersMu.Lock()
		for sub := range server.subscribers {
			if sub.lastPosition != nil {
				for conn := range server.connections {
					err := conn.Write(context.Background(), websocket.MessageText, sub.lastPosition)
					if err != nil {
						server.logf("failed to send last message to connection: %v", err)
						// Remove the connection if sending fails
						delete(server.connections, conn)
					}
				}
			}
		}
		server.subscribersMu.Unlock()
	}
}

func (server *Server) broadcastMessages2() {
	for {
		msg := <-server.incoming

		server.subscribersMu.Lock()
		if len(server.subscribers) > 0 {
			for sub := range server.subscribers {
				select {
				case sub.msgs <- msg:
				default:
					sub.closeSlow()
					delete(server.subscribers, sub)
				}
			}
		}
		server.subscribersMu.Unlock()
	}
}
func (server *Server) broadcastMessages() {
	for {
		msg := <-server.broadcast

		server.subscribersMu.Lock()
		for conn := range server.connections {
			err := conn.Write(context.Background(), websocket.MessageText, msg)
			if err != nil {
				server.logf("failed to send message to connection: %v", err)
				// Remove the connection if sending fails
				delete(server.connections, conn)
			}
		}
		server.subscribersMu.Unlock()
	}
}

func echoTimer2(ctx context.Context, c *websocket.Conn, l *rate.Limiter, messages chan []byte) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	err := l.Wait(ctx)
	if err != nil {
		return err
	}

	_, r, err := c.Reader(ctx)
	if err != nil {
		return err
	}

	// Read the incoming message
	msg, err := io.ReadAll(r)
	if err != nil {
		return fmt.Errorf("failed to read message: %w", err)
	}

	// Send the message to the messages channel
	messages <- msg

	err = c.Close(websocket.StatusNormalClosure, "")
	return err
}

func echoTimer(ctx context.Context, c *websocket.Conn, l *rate.Limiter, broadcast chan []byte, sub *subscriber) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	err := l.Wait(ctx)
	if err != nil {
		return err
	}

	_, r, err := c.Reader(ctx)
	if err != nil {
		return err
	}

	// Read the incoming message
	msg, err := io.ReadAll(r)
	if err != nil {
		return fmt.Errorf("failed to read message: %w", err)
	}

	// Store the last message of the subscriber
	sub.lastPosition = msg

	// Send the message to the broadcast channel
	broadcast <- msg

	err = c.Close(websocket.StatusNormalClosure, "")
	return err
}

func echoMult(ctx context.Context, c *websocket.Conn, l *rate.Limiter, broadcast chan []byte) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	err := l.Wait(ctx)
	if err != nil {
		return err
	}

	_, r, err := c.Reader(ctx)
	if err != nil {
		return err
	}

	// Read the incoming message
	msg, err := io.ReadAll(r)
	if err != nil {
		return fmt.Errorf("failed to read message: %w", err)
	}

	// Send the message to the broadcast channel
	broadcast <- msg

	// Close the connection
	// fmt.Print("Closing connection")
	// err = c.Close(websocket.StatusNormalClosure, "")
	return err
}

// echo reads from the WebSocket connection and then writes
// the received message back to it.
func echo(ctx context.Context, c *websocket.Conn, l *rate.Limiter) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	err := l.Wait(ctx)
	if err != nil {
		return err
	}

	typ, r, err := c.Reader(ctx)
	if err != nil {
		return err
	}

	w, err := c.Writer(ctx, typ)
	if err != nil {
		return err
	}

	_, err = io.Copy(w, r)
	if err != nil {
		return fmt.Errorf("failed to io.Copy: %w", err)
	}

	err = w.Close()
	return err
}
