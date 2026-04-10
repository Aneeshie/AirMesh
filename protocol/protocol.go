package protocol

import (
	"encoding/binary"
	"net"
)

func SendMessage(conn net.Conn, message string){
	data := []byte(message)

	length:= uint32(len(data))
	lengthBuf := make([]byte,4)
	binary.BigEndian.PutUint32(lengthBuf, length)

	conn.Write(lengthBuf)
	conn.Write(data)
}

func ReadExact(conn net.Conn, size int) ([]byte, error){
	buffer := make([]byte, size)

	total := 0

	for total < size {
		n, err := conn.Read(buffer)
		if err != nil {
			return nil,err
		}

		total += n
	}

	return buffer, nil
}
