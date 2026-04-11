package main

import (
	ui "file-sharing-backend/UI"
	"file-sharing-backend/discovery"
	"file-sharing-backend/protocol"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"time"
)

func main() {
	var ip string

	peers := discovery.ScanPeers()
	discovery.PrintPeers(peers)

	if len(peers) > 0 {
		var choice int
		fmt.Print("Choose device number: ")
		fmt.Scan(&choice)

		ip = peers[choice-1].Address
	} else {
		fmt.Print("Enter server ip: ")
		fmt.Scan(&ip)
	}

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

	start := time.Now()
	for received < fileSize {
		remaining := fileSize - received
		toRead := uint64(len(buffer))

		toRead = min(toRead, remaining)

		n, err := conn.Read(buffer[:int(toRead)])

		if n > 0 {
			_, writeErr := outFile.Write(buffer[:n])
			if writeErr != nil {
				panic(writeErr)
			}

			received += uint64(n)
			ui.ShowProgress(received, fileSize, start)
		}

		if err != nil {
			if err == io.EOF && received == fileSize {
				break
			}
			panic(err)
		}
	}

	ui.Done(outPath)

}
