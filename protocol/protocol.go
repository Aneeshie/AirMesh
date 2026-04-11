package protocol

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"net"
	"os"
	"path/filepath"
)

func SendMessage(conn net.Conn, path string) {
	var buf bytes.Buffer

	baseName := filepath.Base(path)

	file, err := os.Open(path)
	if err != nil {
		fmt.Println("Could not open file:", err)
		return
	}
	defer file.Close()

	n, err := buf.ReadFrom(file)
	if err != nil {
		fmt.Println("Could not read file:", err)
		return
	}

	//filename length
	nameBytes := []byte(baseName)
	nameLenBuf := make([]byte, 8)
	binary.BigEndian.PutUint64(nameLenBuf, uint64(len(nameBytes)))

	//file size
	sizeBuf := make([]byte, 8)
	binary.BigEndian.PutUint64(sizeBuf, uint64(n))

	conn.Write(nameLenBuf)
	conn.Write(nameBytes)

	conn.Write(sizeBuf)
	conn.Write(buf.Bytes())
}

func ReadExact(conn net.Conn, size int) ([]byte, error) {
	buffer := make([]byte, size)
	total := 0

	for total < size {
		n, err := conn.Read(buffer)
		if err != nil {
			return nil, err
		}

		total += n

	}

	return buffer, nil
}
