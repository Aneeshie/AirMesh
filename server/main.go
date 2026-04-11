package main

import (
	"file-sharing-backend/protocol"
	"fmt"
	"net"
)

func main() {
	ip := getLocalIP()

	fmt.Println("Share this address: ", ip+":8080")

	ln, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("Could not initiate the socket: ", err)
		return
	}

	defer ln.Close()

	fmt.Println("Server is running on port 8080")

	for {
		conn, err := ln.Accept()
		if err != nil {
			fmt.Println("Error accepting ", err)
			continue
		}

		go handleConn(conn)

	}

}

func handleConn(conn net.Conn) {
	defer conn.Close()

	fmt.Println("Client connected: ", conn.RemoteAddr())

	if err := protocol.SendFile(conn, "test.txt"); err != nil {
		fmt.Println("Could not send file: ", err)
		return
	}

}

func getLocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "unknown"
	}

	for _, addrs := range addrs {
		ipNet, ok := addrs.(*net.IPNet)
		if !ok || ipNet.IP.IsLoopback() {
			continue
		}

		ip := ipNet.IP.To4()
		if ip != nil {
			return ip.String()
		}

	}

	return "unknown"
}
