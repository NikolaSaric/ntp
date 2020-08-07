package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/NikolaSaric/ntp/Post_Service/data"
	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson"
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
		p.getPosts(rw, r)
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

func (p *Posts) getPosts(rw http.ResponseWriter, r *http.Request) {
	headPerPage, err := strconv.ParseInt(r.Header.Get("perPage"), 10, 64)
	if err != nil {
		p.l.Println(err)
	}
	headPage, err := strconv.ParseInt(r.Header.Get("page"), 10, 64)
	if err != nil {
		p.l.Println(err)
	}
	paginatedData := data.GetPosts(headPerPage, headPage)

	page := strconv.FormatInt(paginatedData.Pagination.Page, 10)
	totalPages := strconv.FormatInt(paginatedData.Pagination.TotalPage, 10)
	perPage := strconv.FormatInt(paginatedData.Pagination.PerPage, 10)
	rw.Header().Set("page", page)
	rw.Header().Set("totalPages", totalPages)
	rw.Header().Set("perPage", perPage)

	var posts []data.Post
	for _, raw := range paginatedData.Data {
		var post *data.Post
		if marshallErr := bson.Unmarshal(raw, &post); marshallErr == nil {
			posts = append(posts, *post)
		}

	}

	encoder := json.NewEncoder(rw)

	encoder.Encode(posts)

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
