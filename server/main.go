package main

import (
	"encoding/binary"
	"file-sharing-backend/protocol"
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


	for {
		n, err := protocol.ReadExact(conn, 4)
		if err != nil {
			fmt.Println("Could not get the stream: ", err)
			return
		}

		lengthBuf := binary.BigEndian.Uint32(n)

		dataBuf, err := protocol.ReadExact(conn, int(lengthBuf))
		if err != nil {
			fmt.Println("Could not read the stream: ", err)
			return
		}


		fmt.Println("Client says: ", string(dataBuf))

		response := "hello client from server"
		protocol.SendMessage(conn, response)
	}
}
