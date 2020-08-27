package data

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Comment : represents struct for a signle Post
type Comment struct {
	ID        string    `json:"id"`
	CommentID string    `json:"commentID"`
	PostID    string    `json:"postID"`
	Author    string    `json:"author"`
	Body      string    `json:"body"`
	Replies   []Comment `json:"replies"`
	CreatedOn string    `json:"createdOn"`
}

var collection *mongo.Collection

// InitDatabase : initate Mongo database
func InitDatabase() {
	// Set client options
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")

	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	// Set collection for futher use
	collection = client.Database("ntp-comment").Collection("comment")

	fmt.Println("Connected to Comment MongoDB!")
}

// Save : save new Comment to MongoDB
func Save(comment *Comment) *mongo.InsertOneResult {

	insertResult, err := collection.InsertOne(context.TODO(), comment)
	if err != nil {
		log.Fatal(err)
	}

	return insertResult

}

// GetByPostID : return Comment by Post ID
func GetByPostID(id primitive.ObjectID) *mongo.Cursor {

	result, err := collection.Find(context.TODO(), bson.M{"postid": id})

	if err != nil {
		log.Fatal(err)
	}

	return result
}

// Update : update comment with new one
func Update(id primitive.ObjectID, comment *Comment) *mongo.UpdateResult {

	result, err := collection.ReplaceOne(context.TODO(), bson.M{"postid": comment.ID}, comment)

	if err != nil {
		log.Fatal(err)
	}

	return result
}
