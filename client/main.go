package main

import (
	"encoding/binary"
	"file-sharing-backend/protocol"
	"fmt"
	"net"
)

func main(){
	conn, err := net.Dial("tcp", ":8080")
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	message := "hello server"
	protocol.SendMessage(conn, message)

	n, err := protocol.ReadExact(conn, 4)
	if err != nil {
		panic(err)
	}

	lengthBuf := binary.BigEndian.Uint32(n)

	dataBuf, err := protocol.ReadExact(conn, int(lengthBuf))
	if err != nil {
		fmt.Println("Could not get data stream ", err)
		return
	}

	messageReceived := string(dataBuf)

	fmt.Println("Message by server: ",messageReceived)

}


