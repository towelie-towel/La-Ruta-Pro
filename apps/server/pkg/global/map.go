package global

import (
	"context"
	"log"

	"googlemaps.github.io/maps"
)

var MapClient *maps.Client

func init() {
	var err error
	MapClient, err = maps.NewClient(maps.WithAPIKey("AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE"))
	if err != nil {
		log.Fatalf("fatal map init error: %s", err)
	}
}

// traditional function
func GetRoute(mapClient *maps.Client, from, to string) []maps.Route {
	request := &maps.DirectionsRequest{
		Origin:      from,
		Destination: to,
	}
	route, _, err := mapClient.Directions(context.Background(), request)
	if err != nil {
		log.Fatalf("fatal direction error: %s", err)
	}
	return route
}
