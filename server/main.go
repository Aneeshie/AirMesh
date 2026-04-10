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

		go handleConn(conn)

	}

}

func handleConn(conn net.Conn) {
	defer conn.Close()

	fmt.Println("Client connected: ", conn.RemoteAddr())
	//read data

	buffer := make([]byte, 1024)

	for {
		n, err := conn.Read(buffer)
		if err != nil {
			fmt.Println("Could not read the stream: ", err)
			return
		}

		message := string(buffer[:n])
		fmt.Println("Client says: ", message)

		response := "hello client from server"
		conn.Write([]byte(response))
	}
}
