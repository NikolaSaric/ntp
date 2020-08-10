package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/NikolaSaric/ntp/Post_Service/data"
	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var secret = "MusicFlow"

// Posts is a http.Handler
type Posts struct {
	l *log.Logger
}

// NewPosts : creates a posts handler with the given logger
func NewPosts(l *log.Logger) *Posts {
	return &Posts{l}
}

// ServeHTTP is the main entry point for the handler
func (p *Posts) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	// handle the request for a list of products
	if r.Method == http.MethodGet {
		// GetPosts
		p.l.Println("Recieved GET ALL request")
		return
	}

	if r.Method == http.MethodPost {
		// AddPosts
		p.l.Println("Recieved POST request")
		p.addPost(rw, r)
		return
	}

	if r.Method == http.MethodPut {

		// UpadatePost
		p.l.Println("Recieved PUT request")
		return
	}

	// catch all
	// if no method is satisfied return an error
	rw.WriteHeader(http.StatusMethodNotAllowed)
}

func (p *Posts) addPost(rw http.ResponseWriter, r *http.Request) {
	tokenString := r.Header.Get("jwt")
	claims := jwt.MapClaims{}

	_, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		p.l.Println(err)

		return
	}
	decoder := json.NewDecoder(r.Body)
	var newPost data.Post
	err = decoder.Decode(&newPost)
	if err != nil {
		p.l.Println(err)
	}

	newPost.Username = claims["username"].(string)
	newPost.CreatedOn = time.Now().UTC().String()
	newPost.ID = data.Save(&newPost).InsertedID.(primitive.ObjectID).Hex()
	encoder := json.NewEncoder(rw)

	err = encoder.Encode(newPost)
	if err != nil {
		p.l.Println(err)
	}

	log.Println(newPost)

}

// UploadFile : Saves uploaded file from front-end
func (p *Posts) UploadFile(rw http.ResponseWriter, r *http.Request) {
	p.l.Println("HERE 1")
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		p.l.Println(err)
		http.Error(rw, "Expected multipart form data", http.StatusBadRequest)
		return
	}

	for key, values := range r.PostForm {
		p.l.Println(key)
		p.l.Println(values)
	}

	fileName := r.FormValue("fileName")
	p.l.Println(fileName)
	// fileType := r.FormValue("type")

	ff, _, err := r.FormFile("file")
	if err != nil {
		p.l.Println("Err 1")
		p.l.Println(err)
		http.Error(rw, "Expected file", http.StatusBadRequest)
		return
	}

	defer ff.Close()
	p.l.Println("HERE 2")
	// This is path which we want to store the file
	f, err := os.OpenFile("/pathToStoreFile/"+fileName, os.O_WRONLY|os.O_CREATE, 0666)

	if err != nil {
		p.l.Println("Err 3")
		p.l.Println(err)
		http.Error(rw, "Expected file", http.StatusBadRequest)
		return
	}

	// Copy the file to the destination path
	io.Copy(f, ff)
	p.l.Println("HERE 3")
	return
}
