package main

import (
	"time"
)

type Point struct {
	X float64
	Y float64
	Z float64
}

func GetSunPosNow() *Point {
	point := GetSunPosByTime(time.Now().UTC())
	sunPosition = *point
	return point
}

func GetSunPosByTime(dt time.Time) *Point {
	return GetSunPos(dt.Year(), int(dt.Month()), dt.Day(), dt.Hour(),
		dt.Minute(), float64(dt.Second()))
}
