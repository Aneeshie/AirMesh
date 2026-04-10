package main

import (
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
	conn.Write([]byte(message))

	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		panic(err)
	}

	fmt.Println("Server says: ", string(buffer[:n]))
}


