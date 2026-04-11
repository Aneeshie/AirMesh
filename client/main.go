package main

import (
	"file-sharing-backend/protocol"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
)

func main() {
	var ip string

	fmt.Println("Enter server ip: ")
	fmt.Scan(&ip)

	conn, err := net.Dial("tcp", ip)
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	fileName, fileSize, err := protocol.ParseDataReceived(conn)
	if err != nil {
		panic(err)
	}

	if err := os.MkdirAll("downloads", 0755); err != nil {
		panic(err)
	}

	safeName := filepath.Base(fileName)

	outPath := filepath.Join("downloads", safeName)

	outFile, err := os.Create(outPath)
	if err != nil {
		panic(err)
	}

	defer outFile.Close()

	buffer := make([]byte, 64*1024)
	var received uint64 = 0

	for received < fileSize {
		remaining := fileSize - received
		toRead := uint64(len(buffer))

		toRead = min(toRead, remaining)

		n, err := conn.Read(buffer[:toRead])

		if n > 0 {
			_, writeErr := outFile.Write(buffer[:n])
			if writeErr != nil {
				panic(writeErr)
			}

			received += uint64(n)
		}

		if err != nil {
			if err == io.EOF && received == fileSize {
				break
			}
			panic(err)
		}
	}

	fmt.Println("Saved to:", outPath)

}
