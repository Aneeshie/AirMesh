package ui

import (
	"fmt"
	"strings"
)

func ShowProgress(received, total uint64) {
	if total == 0 {
		return
	}

	percent := float64(received) / float64(total) * 100

	barWidth := 50
	filled := int(percent / 100 * float64(barWidth))

	if filled > barWidth {
		barWidth = filled
	}

	bar := strings.Repeat("=", filled) + strings.Repeat(" ", barWidth-filled)

	fmt.Printf("\r[%s] %.2f%%", bar, percent)
}

func Done(path string) {
	fmt.Println()
	fmt.Println("Saved to: ", path)
}
