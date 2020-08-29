package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/NikolaSaric/ntp/Comment_Service/data"
	"github.com/gorilla/mux"

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

// AddComment :  add new omment to db
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
	newComment.Replies = make([]data.Comment, 0)
	newComment.ID = data.Save(&newComment).InsertedID.(primitive.ObjectID).Hex()
	encoder := json.NewEncoder(rw)

	err = encoder.Encode(newComment)
	if err != nil {
		c.l.Println(err)
	}
}

// GetCommentsByPost : get comments by given post ID.
func (c *Comments) GetCommentsByPost(rw http.ResponseWriter, r *http.Request) {
	// Get post id from url path
	vars := mux.Vars(r)
	id := vars["id"]
	c.l.Println("GET Comments: " + id)

	results := data.GetByPostID(id)

	c.l.Println(results)

	encoder := json.NewEncoder(rw)

	err := encoder.Encode(results)
	if err != nil {
		c.l.Println(err)
	}
}
