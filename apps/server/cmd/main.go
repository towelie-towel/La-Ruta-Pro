package main

import (
	"context"
	"errors"
	"flag"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"time"

	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
)

// Server enables broadcasting to a set of subscribers.
type Server struct {
	// defaultSmsBuff controls the max number
	// of messages that can be queued for a subscriber
	// before it is kicked.
	//
	// Defaults to 16.
	defaultSmsBuff int

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

	/* taxiSmsBuff   int
	clientSmsBuff int

	taxisWS   map[string]taxiSub
	clientsWS map[string]clientSub */
}

// subscriber represents a subscriber.
// Messages are sent on the msgs channel and if the client
// cannot keep up with the messages, closeSlow is called.
type subscriber struct {
	msgs      chan []byte
	closeSlow func()
}

/*
type taxiSub struct {
	stream    chan []byte
	closeSlow func()
	quality   string // Connection quality (e.g., "high", "medium", "low")

	role     string
	userId   string
	location string
}

type clientSub struct {
	msgs      chan []byte
	closeSlow func()
	quality   string // Connection quality (e.g., "high", "medium", "low")

	role     string
	userId   string
	location string
} */

func main() {
	flag.Parse()
	log.SetFlags(0)

	err := run()
	if err != nil {
		log.Fatalf("fatal socket error: %s", err)
	}
}

// run initializes the Server and then
// starts a http.Server for the passed in address.
func run() error {

	// running server
	var addr = "192.168.1.103:6942"

	if len(os.Args) >= 2 {
		addr = os.Args[1]
	}

	l, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	log.Printf("listening on http://%v", l.Addr())

	mainServer := newServer()
	httpServer := &http.Server{
		Handler:      mainServer,
		ReadTimeout:  time.Second * 10,
		WriteTimeout: time.Second * 10,
	}
	errc := make(chan error, 1)
	go func() {
		errc <- httpServer.Serve(l)
	}()

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, os.Interrupt)
	select {
	case err := <-errc:
		log.Printf("failed to serve: %v", err)
	case sig := <-sigs:
		log.Printf("terminating: %v", sig)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	return httpServer.Shutdown(ctx)
}

// newServer constructs a Server with the defaults.
func newServer() *Server {
	mainServer := &Server{
		defaultSmsBuff: 16,
		logf:           log.Printf,
		subscribers:    make(map[*subscriber]struct{}),
		publishLimiter: rate.NewLimiter(rate.Every(time.Millisecond*100), 8),
	}
	mainServer.serveMux.Handle("/", http.FileServer(http.Dir("./chat")))
	mainServer.serveMux.HandleFunc("/subscribe", mainServer.subscribeHandler)
	mainServer.serveMux.HandleFunc("/publish", mainServer.publishHandler)

	return mainServer
}

func (mainServer *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mainServer.serveMux.ServeHTTP(w, r)
}

// subscribeHandler accepts the WebSocket connection and then subscribes
// it to all future messages.
func (mainServer *Server) subscribeHandler(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, nil)
	if err != nil {
		mainServer.logf("%v", err)
		return
	}
	defer c.Close(websocket.StatusInternalError, "")

	err = mainServer.subscribe(r.Context(), c)
	if errors.Is(err, context.Canceled) {
		return
	}
	if websocket.CloseStatus(err) == websocket.StatusNormalClosure ||
		websocket.CloseStatus(err) == websocket.StatusGoingAway {
		return
	}
	if err != nil {
		mainServer.logf("%v", err)
		return
	}
}

// publishHandler reads the request body with a limit of 8192 bytes and then publishes
// the received message.
func (mainServer *Server) publishHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	body := http.MaxBytesReader(w, r.Body, 8192)
	msg, err := io.ReadAll(body)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusRequestEntityTooLarge), http.StatusRequestEntityTooLarge)
		return
	}

	mainServer.publish(msg)

	w.WriteHeader(http.StatusAccepted)
}

// subscribe subscribes the given WebSocket to all broadcast messages.
// It creates a subscriber with a buffered msgs chan to give some room to slower
// connections and then registers the subscriber. It then listens for all messages
// and writes them to the WebSocket. If the context is cancelled or
// an error occurs, it returns and deletes the subscription.
//
// It uses CloseRead to keep reading from the connection to process control
// messages and cancel the context if the connection drops.
func (mainServer *Server) subscribe(ctx context.Context, c *websocket.Conn) error {
	// ctx = c.CloseRead(ctx)
	s := &subscriber{
		msgs: make(chan []byte, mainServer.defaultSmsBuff),
		closeSlow: func() {
			c.Close(websocket.StatusPolicyViolation, "connection too slow to keep up with messages")
		},
	}
	mainServer.addSubscriber(s)
	defer mainServer.deleteSubscriber(s)

	for {
		select {
		case msg := <-s.msgs:
			err := writeTimeout(ctx, time.Second*5, c, msg)
			if err != nil {
				return err
			}
		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

// publish publishes the msg to all subscribers.
// It never blocks and so messages to slow subscribers
// are dropped.
func (mainServer *Server) publish(msg []byte) {
	mainServer.subscribersMu.Lock()
	defer mainServer.subscribersMu.Unlock()

	mainServer.publishLimiter.Wait(context.Background())

	for s := range mainServer.subscribers {
		select {
		case s.msgs <- msg:
		default:
			go s.closeSlow()
		}
	}
}

// addSubscriber registers a subscriber.
func (mainServer *Server) addSubscriber(s *subscriber) {
	mainServer.subscribersMu.Lock()
	mainServer.subscribers[s] = struct{}{}
	mainServer.subscribersMu.Unlock()
}

// deleteSubscriber deletes the given subscriber.
func (mainServer *Server) deleteSubscriber(s *subscriber) {
	mainServer.subscribersMu.Lock()
	delete(mainServer.subscribers, s)
	mainServer.subscribersMu.Unlock()
}

func writeTimeout(ctx context.Context, timeout time.Duration, c *websocket.Conn, msg []byte) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	return c.Write(ctx, websocket.MessageText, msg)
}