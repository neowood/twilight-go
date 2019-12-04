package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

var sunPosition *Point
var twilightPoints *[]Point

func main() {
	//Starting the API server
	router := UserRoutes()
	http.Handle("/api/", router)

	//Starting the FileServer
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/", fs)

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":3000", nil))

}

func UserRoutes() *mux.Router {
	var router = mux.NewRouter()
	router = mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/api/twilight", GetTwilightPointsJsonHandler)
	router.HandleFunc("/api/sunpos", GetSunPosJsonHandler)
	return router
}

func GetSunPosJsonHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	sunpos := GetSunPosJsonNow()
	json.NewEncoder(w).Encode(sunpos)
}

func GetSunPosHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	sunpos := GetSunPosNow()
	json.NewEncoder(w).Encode(sunpos)
}

func GetTwilightPointsJsonHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	points := GetTwilightLineJsonNow()
	json.NewEncoder(w).Encode(points)
}
