package google_map

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"googlemaps.github.io/maps"
)

type Location struct {
	Lat float64
	Lon float64
}

func (loc Location) String() string {
	return fmt.Sprintf("%f,%f", loc.Lat, loc.Lon)
}

func ParseLocation(location string) (Location, error) {
	pair := strings.Split(location, ",")
	if len(pair) != 2 {
		return Location{}, fmt.Errorf("invalid location format")
	}
	latitude, err := strconv.ParseFloat(strings.TrimSpace(pair[0]), 64)
	if err != nil {
		return Location{}, fmt.Errorf("invalid latitude: %v", err)
	}
	longitude, err := strconv.ParseFloat(strings.TrimSpace(pair[1]), 64)
	if err != nil {
		return Location{}, fmt.Errorf("invalid longitude: %v", err)
	}
	return Location{Lat: latitude, Lon: longitude}, nil
}

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
