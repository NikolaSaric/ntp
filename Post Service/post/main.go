package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/NikolaSaric/ntp/Post_Service/data"
	"github.com/NikolaSaric/ntp/Post_Service/fileHandlers"
	"github.com/NikolaSaric/ntp/Post_Service/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {

	data.InitDatabase()

	l := log.New(os.Stdout, "posts ", log.LstdFlags)

	// create the handlers
	ph := handlers.NewPosts(l)
	fh := fileHandlers.NewFileHandler(l)

	// create a new serve mux and register the handlers
	sm := mux.NewRouter()
	sm.HandleFunc("/post/", ph.AddPost).Methods(http.MethodPost)
	sm.HandleFunc("/post/{id}", ph.DeletePost).Methods(http.MethodDelete)
	sm.HandleFunc("/post/like/{id}", ph.LikePost).Methods(http.MethodPut)
	sm.HandleFunc("/post/unlike/{id}", ph.UnlikePost).Methods(http.MethodPut)
	sm.HandleFunc("/post/file", fh.UploadFile).Methods(http.MethodPost)
	sm.HandleFunc("/post/image/{id}", fh.GetImage).Methods(http.MethodGet)
	sm.HandleFunc("/post/video/{id}", fh.GetVideo).Methods(http.MethodGet)
	sm.HandleFunc("/post/audio/{id}", fh.GetAudio).Methods(http.MethodGet)

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
		Addr:         ":8081",           // configure the bind address
		Handler:      cf.Handler(sm),    // set the default handler
		ErrorLog:     l,                 // set the logger for the server
		ReadTimeout:  5 * time.Second,   // max time to read request from the client
		WriteTimeout: 10 * time.Second,  // max time to write response to the client
		IdleTimeout:  120 * time.Second, // max time for connections using TCP Keep-Alive
	}

	// start the server
	go func() {
		l.Println("Starting server on port 8081")

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
