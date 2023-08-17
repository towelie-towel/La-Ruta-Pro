package utils

import (
	"strings"
)

func extractProtocols(subprotocol string) []string {
	protocols := strings.Split(subprotocol, ",")
	for i := range protocols {
		protocols[i] = strings.TrimSpace(protocols[i])
	}
	return protocols
}

func hasProtocol(protocols []string, protocol string) bool {
	for _, p := range protocols {
		if p == protocol {
			return true
		}
	}
	return false
}
