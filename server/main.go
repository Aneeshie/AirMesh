package main

import (
	"fmt"
	"net"
)

func main() {
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

		fmt.Println("Client connected: ", conn.RemoteAddr())
	}

}
