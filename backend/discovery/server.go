package discovery

import (
	"fmt"
	"net"
	"os"
	"strings"
)

func StartResponder() {
	addr := net.UDPAddr{
		Port: 9999,
		IP:   net.IPv4zero,
	}

	fmt.Println("Starting UDP responder on :9999")

	conn, err := net.ListenUDP("udp", &addr)
	if err != nil {
		fmt.Println("UDP responder failed:", err)
		return
	}

	fmt.Println("UDP responder ready")

	go func() {
		defer conn.Close()

		buffer := make([]byte, 1024)

		for {
			n, clientAddr, err := conn.ReadFromUDP(buffer)
			if err != nil {
				continue
			}

			msg := strings.TrimSpace(string(buffer[:n]))

			if msg == "DISCOVER_FILE_SERVER" {
				host, _ := os.Hostname()

0"

				fmt.Println("Discovery request from:", clientAddr)
				fmt.Println("Sending reply:", reply)

				conn.WriteToUDP([]byte(reply), clientAddr)
			}
		}
	}()
}
