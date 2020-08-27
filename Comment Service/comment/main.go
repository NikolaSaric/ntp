package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/NikolaSaric/ntp/Comment_Service/data"
	"github.com/NikolaSaric/ntp/Comment_Service/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {

	data.InitDatabase()

	l := log.New(os.Stdout, "comments ", log.LstdFlags)

	// create the handlers
	ch := handlers.NewCommentHandler(l)

	// create a new serve mux and register the handlers
	sm := mux.NewRouter()
	sm.HandleFunc("/comment/", ch.AddComment).Methods(http.MethodPost)

	// CORS
	cf := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Jwt", "Page", "PerPage", "Content-Type"},
		AllowCredentials: true,
		// Enable Debugging for testing, consider disabling in production
		Debug: true,
	})

	// create a new server
	s := http.Server{
		Addr:         ":8083",           // configure the bind address
		Handler:      cf.Handler(sm),    // set the default handler
		ErrorLog:     l,                 // set the logger for the server
		ReadTimeout:  5 * time.Second,   // max time to read request from the client
		WriteTimeout: 10 * time.Second,  // max time to write response to the client
		IdleTimeout:  120 * time.Second, // max time for connections using TCP Keep-Alive
	}

	// start the server
	go func() {
		l.Println("Starting Comment service on port 8083")

		err := s.ListenAndServe()
		if err != nil {
			l.Printf("Error starting server: %s\n", err)
			os.Exit(1)
		}
	}()

	// trap sigterm or interupt and gracefully shutdown the server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, os.Kill)

	// Block until a signal is received.
	sig := <-c
	log.Println("Got signal:", sig)

	// gracefully shutdown the server, waiting max 30 seconds for current operations to complete
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	s.Shutdown(ctx)

}
