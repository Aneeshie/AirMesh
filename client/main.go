package main

import (
	"file-sharing-backend/protocol"
	"net"
	"os"
	"path/filepath"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:8080")
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	fileName, _, fileData, err := protocol.ParseDataReceived(conn)
	if err != nil {
		panic(err)
	}

	if err := os.MkdirAll("downloads", 0755); err != nil {
		panic(err)
	}

	safeName := filepath.Base(fileName)

	outPath := filepath.Join("downloads", safeName)

	if err := os.WriteFile(outPath, fileData, 0644); err != nil {
		panic(err)
	}

}
