package handlers

import (
	"encoding/json"
	"log"
	"net/http"
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

// AddPost adds new post to db
func (p *Posts) AddPost(rw http.ResponseWriter, r *http.Request) {
	p.l.Println("POST Add Post")

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
