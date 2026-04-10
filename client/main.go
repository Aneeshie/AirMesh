package main

import (
	"net"
)

func main(){
	_, err := net.Dial("tcp", ":8080")
	if err != nil {
		panic(err)
	}

}
