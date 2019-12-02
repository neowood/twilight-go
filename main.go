package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

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
	router.HandleFunc("/api/points", GetTwilightPointsHandler)
	router.HandleFunc("/api/sunpos", GetSunPosHandler)
	return router
}

func GetSunPosHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	sunpos := GetSunPosNow()
	log.Println(*sunpos)
	json.NewEncoder(w).Encode(sunpos)
}

func GetTwilightPointsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	/*
		params := mux.Vars(r)
		for _, item := range posts {
		  if item.ID == params["id"] {
			json.NewEncoder(w).Encode(item)
			break
		  }
		  return
		}
	*/
	points := GetTwilightPoints()
	//log.Println(*points)
	json.NewEncoder(w).Encode(points)
}
