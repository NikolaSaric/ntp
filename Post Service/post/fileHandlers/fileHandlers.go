package fileHandlers

import (
	"io"
	"log"
	"net/http"
	"os"

	"path/filepath"
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

	fh.l.Println("HERE 1")
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fh.l.Println(err)
		http.Error(rw, "Expected multipart form data", http.StatusBadRequest)
		return
	}

	ff, _, err := r.FormFile("file")
	if err != nil {
		fh.l.Println("Err 1")
		fh.l.Println(err)
		http.Error(rw, "Expected file", http.StatusBadRequest)
		return
	}

	defer ff.Close()

	fh.l.Println("HERE 2")
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

	path := filepath.Join(absPath, "resources", folder, fileName+"."+r.FormValue("extension"))
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0666)

	if err != nil {
		fh.l.Println("Err 3")
		fh.l.Println(err)
		http.Error(rw, "Expected file", http.StatusBadRequest)
		return
	}

	// Copy the file to the destination path
	io.Copy(f, ff)
	fh.l.Println("HERE 3")
	return
}
