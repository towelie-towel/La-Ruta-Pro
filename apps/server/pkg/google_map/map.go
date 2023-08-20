package google_map

import (
	"context"
	"log"
	"os"

	"googlemaps.github.io/maps"
)

func NewMapClient() (*maps.Client, error) {
	return maps.NewClient(maps.WithAPIKey(os.Getenv("GOOGLE_MAPS_API_KEY")))
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
