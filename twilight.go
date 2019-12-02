package main

type Point struct {
	X float32
	Y float32
}

func GetTwilightPoints() *[]Point {
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
