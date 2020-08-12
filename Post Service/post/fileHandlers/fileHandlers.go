package fileHandlers

import (
	"bufio"
	"encoding/base64"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"path/filepath"

	"github.com/gorilla/mux"
)

// FileHandler is a http.Handler
type FileHandler struct {
	l *log.Logger
}

// NewFileHandler : creates a posts handler with the given logger
func NewFileHandler(l *log.Logger) *FileHandler {
	return &FileHandler{l}
}

// UploadFile : Saves uploaded file from front-end
func (fh *FileHandler) UploadFile(rw http.ResponseWriter, r *http.Request) {
	fh.l.Println("POST Upload File")

	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fh.l.Println(err)
		http.Error(rw, "Expected multipart form data", http.StatusBadRequest)
		return
	}

	ff, _, err := r.FormFile("file")
	if err != nil {
		fh.l.Println(err)
		http.Error(rw, "Expected file", http.StatusBadRequest)
		return
	}

	defer ff.Close()

	// Get absolute path to the base.
	absPath, err := os.Getwd()
	if err != nil {
		fh.l.Println(err)
	}
	// Concat absolute path for file storing
	var folder string
	fileName := r.FormValue("fileName")
	fileType := r.FormValue("type")

	switch fileType {
	case "Image":
		folder = "images"
	case "Audio":
		folder = "audios"
	case "Video":
		folder = "videos"
	}

	path := filepath.Join(absPath, "resources", folder, fileName)
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0666)

	if err != nil {
		fh.l.Println(err)
		http.Error(rw, "Expected file", http.StatusBadRequest)
		return
	}

	// Copy the file to the destination path
	io.Copy(f, ff)
	return
}

// GetImage from image folder
func (fh *FileHandler) GetImage(rw http.ResponseWriter, r *http.Request) {

	// Get image id from url path
	vars := mux.Vars(r)
	id := vars["id"]
	fh.l.Println("GET Image: " + id)

	absPath, err := os.Getwd()
	if err != nil {
		fh.l.Println(err)
	}

	path := filepath.Join(absPath, "resources", "images", id)

	// Open file on disk.
	f, _ := os.Open(path)

	// Read entire JPG into byte slice.
	reader := bufio.NewReader(f)
	content, _ := ioutil.ReadAll(reader)

	// Encode as base64.
	encoded := base64.StdEncoding.EncodeToString(content)
	// Print encoded data to console.
	// ... The base64 image can be used as a data URI in a browser.

	rw.Write([]byte(encoded))
	return
}

// GetVideo from image folder
func (fh *FileHandler) GetVideo(rw http.ResponseWriter, r *http.Request) {

	// Get video id from url path
	fh.ServeVideoAudio(rw, r, "videos")
}

// GetAudio from image folder
func (fh *FileHandler) GetAudio(rw http.ResponseWriter, r *http.Request) {

	// Get video id from url path
	fh.ServeVideoAudio(rw, r, "audios")
}

// ServeVideoAudio media files
func (fh *FileHandler) ServeVideoAudio(rw http.ResponseWriter, r *http.Request, mediaType string) {
	// Get video id from url path
	vars := mux.Vars(r)
	id := vars["id"]
	fh.l.Println("GET Video: " + id)

	absPath, err := os.Getwd()
	if err != nil {
		fh.l.Println(err)
	}

	path := filepath.Join(absPath, "resources", mediaType, id)

	// Open file on disk.
	f, _ := os.Open(path)

	http.ServeContent(rw, r, id, time.Now(), f)

	defer f.Close()
}
