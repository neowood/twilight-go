package main

import (
	"time"
)

type Point struct {
	X float64
	Y float64
	Z float64
}

func GetTwilightPoints() *[]Point {
	return GetTwilightLineNow()
}

func GetSunPosNow() *Point {
	return GetSunPosByTime(time.Now().UTC())
}

func GetSunPosByTime(dt time.Time) *Point {
	return GetSunPos(dt.Year(), int(dt.Month()), dt.Day(), dt.Hour(),
		dt.Minute(), float64(dt.Second()))
}
