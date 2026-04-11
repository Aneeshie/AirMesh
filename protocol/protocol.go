package protocol

import (
	"encoding/binary"
	"io"
	"net"
	"os"
	"path/filepath"
)

func SendFile(conn net.Conn, path string) error {
	baseName := filepath.Base(path)

	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		return err
	}
	fileSize := stat.Size()

	//filename length
	nameBytes := []byte(baseName)
	nameLenBuf := make([]byte, 8)
	binary.BigEndian.PutUint64(nameLenBuf, uint64(len(nameBytes)))

	//file size
	sizeBuf := make([]byte, 8)
	binary.BigEndian.PutUint64(sizeBuf, uint64(fileSize))

	conn.Write(nameLenBuf)
	conn.Write(nameBytes)

	conn.Write(sizeBuf)

	buffer := make([]byte, 64*1024)

	for {
		n, err := file.Read(buffer)

		if n > 0 {
			_, writeErr := conn.Write(buffer[:n])
			if writeErr != nil {
				return writeErr
			}
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			return err
		}
	}

	return nil
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

func ParseDataReceived(conn net.Conn) (string, uint64, error) {
	nameLenBuf, err := ReadExact(conn, 8)
	if err != nil {
		return "", 0, err
	}

	nameLen := binary.BigEndian.Uint64(nameLenBuf)

	nameBytes, err := ReadExact(conn, nameLen)
	if err != nil {
		return "", 0, err
	}

	sizeBuf, err := ReadExact(conn, 8)
	if err != nil {
		return "", 0, err
	}

	fileSize := binary.BigEndian.Uint64(sizeBuf)

	return string(nameBytes), fileSize, nil
}
