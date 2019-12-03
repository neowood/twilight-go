package main

import (
	"time"

	"github.com/labstack/gommon/log"
	"github.com/robfig/cron/v3"
)

var c *cron.Cron

func init() {
	c = cron.New()
	c.AddFunc("@every 10m", UpdateTwilightLine)
	c.Start()
}

func UpdateTwilightLine() {
	log.Info("schedule for updating")
	sunPosition = GetSunPosByTime(time.Now().UTC())
	twilightPoints = GetTwilightLine(sunPosition)
}
