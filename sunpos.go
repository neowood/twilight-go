package main

import (
	"math"
	"sort"
)

const EPOCH_JAN1_12H_2000 = 2451545.0
const SEC_PER_DAY = 86400.0

// Seconds per day (solar)
const OMEGA_E = 1.00273790934

// Earth rotation per sidereal day
const PI = 3.141592653589793
const F = 1.0 / 298.26
const XKMPER = 6378.135

var lon1, lat1, alt1 float64

func isLeapYear(y int) bool {
	return (y%4 == 0 && y%100 != 0) || (y%400 == 0)
}

func sqr(x float64) float64 {
	return (x * x)
}

func julianDate(year, // i.e., 2004
	mon, // 1..12
	day, // 1..31
	hour, // 0..23
	min int, // 0..59
	sec float64 /* = 0.0 */) float64 { // 0..(59.999999...)
	// Calculate N, the day of the year (1..366)
	var N int
	F1 := int((275.0 * mon) / 9.0)
	F2 := int((mon + 9.0) / 12.0)

	if isLeapYear(year) {
		// Leap year
		N = F1 - F2 + day - 30
	} else {
		// Common year
		N = F1 - (2 * F2) + day - 30
	}

	dblDay := float64(N) + (float64(hour)+(float64(min)+(sec/60.0))/60.0)/24.0

	// Now calculate Julian date
	year--
	// Centuries are not leap years unless they divide by 400
	A := (year / 100)
	B := float64(2 - A + (A / 4))

	C := 30.6001 * 14
	D := 1720994.5 // 1720994.5 = Oct 30, year -1
	E := int(365.25 * float64(year))
	NewYears := float64(E) + float64(int(C)) + D + B

	return NewYears + dblDay
}

func mod(a, b float64) float64 {
	return math.Mod(a, b)
}

func toGMST(m_Date float64) float64 {
	UT := mod(m_Date+0.5, 1.0)
	TU := (m_Date - EPOCH_JAN1_12H_2000 - UT) / 36525.0

	GMST := 24110.54841 + TU*
		(8640184.812866+TU*(0.093104-TU*6.2e-06))

	GMST = mod(GMST+SEC_PER_DAY*OMEGA_E*UT, SEC_PER_DAY)

	if GMST < 0.0 {
		GMST += SEC_PER_DAY // "wrap" negative modulo value
	}

	return (2 * PI * (GMST / SEC_PER_DAY))
}

func toGeo(eci *Point, gmst float64) *Point {
	theta := math.Atan2(eci.Y, eci.X)
	lon := mod(theta-gmst, 2*PI)

	if lon < 0.0 {
		lon += (2 * PI) // "wrap" negative modulo
	}

	r := math.Sqrt(sqr(eci.X) + sqr(eci.Y))

	e2 := F * (2.0 - F)
	lat := math.Atan2(eci.Z, r)

	delta := 1.0e-07
	var phi, c float64

	for {
		phi = lat
		c = 1.0 / math.Sqrt(1.0-e2*sqr(math.Sin(phi)))
		lat = math.Atan2(eci.Z+XKMPER*c*e2*math.Sin(phi), r)
		if math.Abs(lat-phi) < delta {
			break
		}
	}

	alt := r/math.Cos(lat) - XKMPER*c

	geo := Point{
		X: lon * 180 / PI,
		Y: lat * 180 / PI,
		Z: alt,
	}
	geo.X = lon * 180 / PI
	if geo.X > 180 {
		geo.X = geo.X - 360
	} else if geo.X < -180 {
		geo.X += 360
	}

	return &geo // degree, degree, kilometers
}

func GetSunPos(year, // i.e., 2004
	mon, // 1..12
	day, // 1..31
	hour, // 0..23
	min int, // 0..59
	sec float64 /* = 0.0 */) *Point { // 0..(59.999999...)

	twopi := 2.0 * PI
	deg2rad := PI / 180.0
	var tut1, meanlong, ttdb, meananomaly, eclplong, obliquity, magr, dbi, dbj, dbk float64
	jul := julianDate(year, mon, day, hour, min, sec) //UTC time
	gmst := toGMST(jul)

	tut1 = (jul - 2451545.0) / 36525.0
	meanlong = 280.460 + 36000.77*tut1
	meanlong = mod(meanlong, 360.0)
	ttdb = tut1
	meananomaly = 357.5277233 + 35999.05034*ttdb
	meananomaly = mod(meananomaly*deg2rad, twopi)
	if meananomaly < 0.0 {
		meananomaly += twopi
	}
	eclplong = meanlong + 1.914666471*math.Sin(meananomaly) + 0.019994643*math.Sin(2.0*meananomaly)
	obliquity = 23.439291 - 0.0130042*ttdb
	meanlong = meanlong * deg2rad
	if meanlong < 0.0 {
		meanlong = twopi + meanlong
	}
	eclplong = eclplong * deg2rad
	obliquity = obliquity * deg2rad
	magr = 1.000140612 - 0.016708617*math.Cos(meananomaly) - 0.000139589*math.Cos(2.0*meananomaly)
	//计算得出太阳的地心坐标系坐标
	dbi = magr * math.Cos(eclplong)
	dbj = magr * math.Cos(obliquity) * math.Sin(eclplong)
	dbk = magr * math.Sin(obliquity) * math.Sin(eclplong)

	//convert to geo
	eciPoint := Point{
		X: dbi * XKMPER,
		Y: dbj * XKMPER,
		Z: dbk * XKMPER,
	}

	return toGeo(&eciPoint, gmst)
}

func GetTwilightLine(sunpos *Point) *[]Point {
	var LonS, LatS, LonA, LonB, LatB, ANB, BN, sita float64
	LonS = sunpos.X * PI / 180
	LatS = -sunpos.Y * PI / 180
	LonA = LonS - PI/2
	line := []Point{}
	for i := 0; i < 360; i++ {
		sita = (float64(i) + 0.001) * PI / 180
		BN = math.Acos(math.Sin(sita) * math.Cos(LatS)) //(0~pi之间)
		danb := math.Sin(LatS) * math.Sin(sita) / math.Sin(BN)
		ANB = math.Asin(danb) //(-pi/2 ~ pi/2之间)
		if i > 90 && i < 270 {
			LonB = LonA + PI - ANB
			LatB = PI/2 - BN
		} else {
			LonB = LonA + ANB
			LatB = PI/2 - BN
		}
		//ajust LonB
		if LonB > PI {
			LonB = LonB - 2*PI
		}

		if LonB < -PI {
			LonB = 2*PI + LonB
		}
		c := Point{
			X: LonB * 180 / PI,
			Y: LatB * 180 / PI,
		}
		line = append(line, c)
	}
	//sort by x
	sort.Slice(line, func(i, j int) bool {
		return line[i].X > line[j].X
	})
	addP1 := line[len(line)-1]
	addP2 := line[0]
	midY := addP2.Y + (-180-addP2.X)*(addP1.Y-addP2.Y)/(addP1.X-addP2.X-360.0)
	addP3 := Point{X: -180, Y: midY}
	addP4 := Point{X: 180, Y: midY}

	maxY := 90.0
	if sunpos.Y > 0 {
		maxY = -90
	}
	addP5 := Point{X: -180, Y: maxY}
	addP6 := Point{X: 180, Y: maxY}

	line = append(line, addP3)
	line = append(line, addP5)
	line = append(line, addP6)
	line = append(line, addP4)
	line = append(line, addP2)

	return &line
}
