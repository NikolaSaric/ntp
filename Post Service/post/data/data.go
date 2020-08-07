package data

import (
	"context"
	"fmt"
	"log"

	mongopagination "github.com/gobeam/mongo-go-pagination"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Post : represents struct for a signle Post
type Post struct {
	ID          string   `json:"id"`
	Username    string   `json:"username"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Type        string   `json:"type"`
	Location    string   `json:"location"`
	Instruments []string `json:"instruments"`
	Tags        []string `json:"tags"`
	CreatedOn   string   `json:"createdOn"`
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
	collection = client.Database("ntp-post").Collection("post")

	fmt.Println("Connected to MongoDB!")
}

// Save : Saves new post to MongoDB
func Save(post *Post) *mongo.InsertOneResult {

	insertResult, err := collection.InsertOne(context.TODO(), post)
	if err != nil {
		log.Fatal(err)
	}

	post.ID = insertResult.InsertedID.(primitive.ObjectID).Hex()

	_, err = collection.UpdateOne(
		context.TODO(),
		bson.M{"_id": insertResult.InsertedID.(primitive.ObjectID)},
		bson.D{
			{"$set", post},
		},
	)

	if err != nil {
		log.Fatal(err)
	}

	return insertResult

}

// GetPosts : returns all posts as pages
func GetPosts(perPage, page int64) *mongopagination.PaginatedData {

	filter := bson.M{}

	// Querying paginated data
	paginatedData, err := mongopagination.New(collection).Limit(perPage).Page(page).Filter(filter).Find()
	if err != nil {
		panic(err)
	}

	return paginatedData

}
