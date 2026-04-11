package discovery

import (
	"net"
	"os"
)

func StartResponder() {
	addr := net.UDPAddr{
		Port: 9999,
		IP:   net.IPv4zero,
	}

	conn, err := net.ListenUDP("udp", &addr)
	if err != nil {
		panic(err)
	}

	go func() {
		defer conn.Close()

		buffer := make([]byte, 1024)

		for {
			n, clientAddr, err := conn.ReadFromUDP(buffer)
			if err != nil {
				continue
			}

			msg := string(buffer[:n])

			if msg == "DISCOVER_FILE_SERVER" {
				host, _ := os.Hostname()
				reply := "FILE_SERVER_RESPONSE:" + host

				conn.WriteToUDP([]byte(reply), clientAddr)
			}
		}
	}()

}
