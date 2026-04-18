package protocol

import (
	"bytes"
	"encoding/binary"
	"net"
	"testing"
)

func TestReadExact(t *testing.T) {
	client, server := net.Pipe()

	expectedData := []byte("hello world")

	// Run writing in a goroutine
	go func() {
		defer server.Close()
		_, err := server.Write(expectedData)
		if err != nil {
			t.Errorf("Failed to write to pipe: %v", err)
		}
	}()

	out, err := ReadExact(client, uint64(len(expectedData)))
	if err != nil {
		t.Fatalf("ReadExact returned an error: %v", err)
	}

	if !bytes.Equal(out, expectedData) {
		t.Fatalf("Expected '%s', got '%s'", expectedData, out)
	}
}

func TestParseDataReceived(t *testing.T) {
	client, server := net.Pipe()

	fileName := "test.txt"
	var fileSize uint64 = 1024

	go func() {
		defer server.Close()
		nameBytes := []byte(fileName)

		nameLenBuf := make([]byte, 8)
		binary.BigEndian.PutUint64(nameLenBuf, uint64(len(nameBytes)))

		sizeBuf := make([]byte, 8)
		binary.BigEndian.PutUint64(sizeBuf, uint64(fileSize))

		// Write according to protocol sequence
		server.Write(nameLenBuf)
		server.Write(nameBytes)
		server.Write(sizeBuf)
	}()

	parsedName, parsedSize, err := ParseDataReceived(client)
	if err != nil {
		t.Fatalf("ParseDataReceived failed: %v", err)
	}

	if parsedName != fileName {
		t.Errorf("Expected filename '%s', got '%s'", fileName, parsedName)
	}

	if parsedSize != fileSize {
		t.Errorf("Expected filesize %d, got %d", fileSize, parsedSize)
	}
}
