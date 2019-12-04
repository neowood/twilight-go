package main

import (
	"time"

	"github.com/labstack/gommon/log"
	geojson "github.com/paulmach/go.geojson"
)

type Point struct {
	X float64
	Y float64
	Z float64
}

func GetSunPosJsonNow() *geojson.Feature {
	log.Info("getting sun pos json...")
	point := GetSunPosNow()
	pointGeo := geojson.NewPointGeometry([]float64{point.X, point.Y})
	return geojson.NewFeature(pointGeo)
}

func GetSunPosNow() *Point {
	if sunPosition == nil {
		log.Info("getting sun position...")
		sunPosition = GetSunPosByTime(time.Now().UTC())
	}
	return sunPosition
}

func GetSunPosByTime(dt time.Time) *Point {
	return GetSunPos(dt.Year(), int(dt.Month()), dt.Day(), dt.Hour(),
		dt.Minute(), float64(dt.Second()))
}

func getTwilightLineNow() *[]Point {
	log.Info("updating twilight line data")
	if twilightPoints == nil {
		twilightPoints = GetTwilightLine(GetSunPosNow())
	}
	return twilightPoints
}

func GetTwilightLineJsonNow() *geojson.Feature {
	points := getTwilightLineNow()
	var segmentPoints [][]float64
	for _, p := range *points {
		segmentPoints = append(segmentPoints, []float64{p.X, p.Y})
	}
	var polygonPoints [][][]float64
	polygonPoints = append(polygonPoints, segmentPoints)
	polygonGeo := geojson.NewPolygonGeometry(polygonPoints)
	return geojson.NewFeature(polygonGeo)
}
