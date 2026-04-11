package discovery

import (
	"fmt"
	"net"
	"strings"
	"time"
)

type Peer struct {
	Name    string
	Address string
}

func ScanPeers() []Peer {
	var peers []Peer

	conn, err := net.ListenPacket("udp4", ":0")
	if err != nil {
		return peers
	}
	defer conn.Close()

	conn.SetDeadline(time.Now().Add(2 * time.Second))

	target := &net.UDPAddr{
		IP:   net.IPv4bcast,
		Port: 9999,
	}

	msg := []byte("DISCOVER_FILE_SERVER")

	_, err = conn.WriteTo(msg, target)
	if err != nil {
		return peers
	}

	buffer := make([]byte, 1024)

	for {
		n, addr, err := conn.ReadFrom(buffer)
		if err != nil {
			break
		}

		reply := strings.TrimSpace(string(buffer[:n]))
		parts := strings.Split(reply, "|")

		if len(parts) != 2 {
			continue
		}

		name := parts[0]
		port := parts[1]

		peer := Peer{
			Name:    name,
			Address: addr.(*net.UDPAddr).IP.String() + ":" + port,
		}

		peers = append(peers, peer)
	}

	return peers
}

func PrintPeers(peers []Peer) {
	if len(peers) == 0 {
		fmt.Println("No devices found.")
		return
	}

	fmt.Println("Devices found:")

	for i, p := range peers {
		fmt.Printf("%d. %s (%s)\n", i+1, p.Name, p.Address)
	}
}
