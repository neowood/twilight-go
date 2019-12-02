package main

import (
	"fmt"
	"time"
)

type Point struct {
	X float64
	Y float64
	Z float64
}

func GetTwilightPoints() *[]Point {
	fmt.Println(GetSunPosNow())
	p1 := Point{
		X: 0,
		Y: 0,
	}
	p2 := Point{
		X: 10,
		Y: 0,
	}
	p3 := Point{
		X: 10,
		Y: 10,
	}
	p4 := Point{
		X: 0,
		Y: 0,
	}
	points := []Point{p1, p2, p3, p4}
	return &points
}

func GetSunPosNow() *Point {
	return GetSunPosByTime(time.Now().UTC())
}

func GetSunPosByTime(dt time.Time) *Point {
	return GetSunPos(dt.Year(), int(dt.Month()), dt.Day(), dt.Hour(),
		dt.Minute(), float64(dt.Second()))
}
