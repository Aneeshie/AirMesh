package protocol

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
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

func ReadExact(conn net.Conn, size uint64) ([]byte, error) {
	buffer := make([]byte, size)
	var total uint64 = 0

	for total < size {
		n, err := conn.Read(buffer[total:])
		if err != nil {
			return nil, err
		}

		if n == 0 {
			return nil, io.EOF
		}

		total += uint64(n)

	}

	return buffer, nil
}

func ParseDataReceived(conn net.Conn) (string, uint64, []byte, error) {
	nameLenBuf, err := ReadExact(conn, 8)
	if err != nil {
		return "", 0, nil, err
	}
	nameLen := binary.BigEndian.Uint64(nameLenBuf)

	nameBytes, err := ReadExact(conn, nameLen)
	if err != nil {
		return "", 0, nil, err
	}

	sizeBuf, err := ReadExact(conn, 8)
	if err != nil {
		return "", 0, nil, err
	}

	fileSize := binary.BigEndian.Uint64(sizeBuf)

	fileData, err := ReadExact(conn, fileSize)
	if err != nil {
		return "", 0, nil, err
	}

	return string(nameBytes), fileSize, fileData, nil

}
