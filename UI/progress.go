package ui

import (
	"fmt"
	"strings"
	"time"
)

func ShowProgress(received uint64, total uint64, start time.Time) {
	if total == 0 {
		return
	}

	percent := float64(received) * 100 / float64(total)

	barWidth := 30
	filled := int(percent / 100 * float64(barWidth))

	if filled > barWidth {
		filled = barWidth
	}

	bar := strings.Repeat("█", filled) +
		strings.Repeat("░", barWidth-filled)

	elapsed := time.Since(start).Seconds()
	if elapsed < 0.001 {
		elapsed = 0.001
	}

	speedMB := float64(received) / 1024 / 1024 / elapsed

	var etaSeconds float64 = 0
	if speedMB > 0 {
		remainingMB := float64(total-received) / 1024 / 1024
		etaSeconds = remainingMB / speedMB
	}

	fmt.Printf(
		"\r[%s] %6.2f%% | %6.2f MB/s | ETA %4.0fs",
		bar,
		percent,
		speedMB,
		etaSeconds,
	)
}

func Done(path string) {
	fmt.Println()
	fmt.Println("Saved to:", path)
}
