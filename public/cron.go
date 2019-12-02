package main

import "github.com/robfig/cron/v3"

var c *cron.Cron

func init() {
	c = cron.New()
	c.AddFunc("@every 10m", GetTwilightLineNow)
	c.Start()
}
