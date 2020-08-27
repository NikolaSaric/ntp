package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/NikolaSaric/ntp/Comment_Service/data"

	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var secret = "MusicFlow"

// Comments : is a http.Handler
type Comments struct {
	l *log.Logger
}

// NewCommentHandler : create a comments handler with the given logger
func NewCommentHandler(l *log.Logger) *Comments {
	return &Comments{l}
}

// AddComment :  add new comment to db
func (c *Comments) AddComment(rw http.ResponseWriter, r *http.Request) {
	c.l.Println("POST Add Comment")

	tokenString := r.Header.Get("jwt")
	claims := jwt.MapClaims{}

	_, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		c.l.Println(err)

		return
	}
	decoder := json.NewDecoder(r.Body)
	var newComment data.Comment
	err = decoder.Decode(&newComment)
	if err != nil {
		c.l.Println(err)
	}

	newComment.Author = claims["username"].(string)
	newComment.CreatedOn = time.Now().UTC().String()
	newComment.ID = data.Save(&newComment).InsertedID.(primitive.ObjectID).Hex()
	encoder := json.NewEncoder(rw)

	err = encoder.Encode(newComment)
	if err != nil {
		c.l.Println(err)
	}

	log.Println(newComment)

}
