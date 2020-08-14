package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"path/filepath"

	"github.com/NikolaSaric/ntp/Post_Service/data"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
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

// DeletePost deletes existing post from db
func (p *Posts) DeletePost(rw http.ResponseWriter, r *http.Request) {
	p.l.Println("DELETE post")

	tokenString := r.Header.Get("jwt")
	claims := jwt.MapClaims{}

	_, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		p.l.Println(err)

		return
	}

	// Get Post id from url path
	vars := mux.Vars(r)
	id := vars["id"]

	// Transforms string id to PrimitiveId
	idPrimitive, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Fatal("primitive.ObjectIDFromHex ERROR:", err)
	}

	var post data.Post
	data.GetByID(idPrimitive).Decode(&post)

	if post.Username == claims["username"].(string) {
		deleteResult := data.Delete(idPrimitive)

		if deleteResult.DeletedCount == 0 {
			rw.Write([]byte("No posts found for given ID."))
			return
		}
		absPath, err := os.Getwd()
		if err != nil {
			p.l.Println(err)
		}

		switch post.Type {
		case "Image":
			err = os.Remove(filepath.Join(absPath, "resources", "images", id))
		case "Audios":
			err = os.Remove(filepath.Join(absPath, "resources", "audios", id))
		case "Videos":
			err = os.Remove(filepath.Join(absPath, "resources", "videos", id))
		}

		if err != nil {
			p.l.Println(err)
		}

		rw.Write([]byte("Successfully deleted post."))
		return
	}

	rw.Write([]byte("You don't have permission to delete this post."))
	return

}
