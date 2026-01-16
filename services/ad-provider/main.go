package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

// EnrichmentResponse represents enrichment data for an ad
type EnrichmentResponse struct {
	AdID       string  `json:"ad_id"`
	BidPrice   float64 `json:"bid_price"`
	Impressions int    `json:"impressions"`
}

// BatchResponse represents a batch enrichment response
type BatchResponse struct {
	Enrichments []EnrichmentResponse `json:"enrichments"`
}

var baseLatencyMs int

func init() {
	rand.Seed(time.Now().UnixNano())

	// Default latency of 100ms, configurable via env
	baseLatencyMs = 100
	if val := os.Getenv("AD_PROVIDER_LATENCY_MS"); val != "" {
		if parsed, err := strconv.Atoi(val); err == nil {
			baseLatencyMs = parsed
		}
	}
}

// simulateLatency adds realistic latency with some jitter
func simulateLatency() {
	jitter := rand.Intn(50) - 25 // +/- 25ms jitter
	latency := baseLatencyMs + jitter
	if latency < 10 {
		latency = 10
	}
	time.Sleep(time.Duration(latency) * time.Millisecond)
}

// enrichHandler handles single ad enrichment requests
// GET /enrich?ad_id=123
func enrichHandler(w http.ResponseWriter, r *http.Request) {
	adID := r.URL.Query().Get("ad_id")
	if adID == "" {
		http.Error(w, "ad_id required", http.StatusBadRequest)
		return
	}

	log.Printf("Enriching single ad: %s", adID)
	simulateLatency()

	response := EnrichmentResponse{
		AdID:        adID,
		BidPrice:    rand.Float64() * 2.0,
		Impressions: rand.Intn(10000),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// batchEnrichHandler handles batch ad enrichment requests
// GET /enrich/batch?ad_ids=1,2,3
func batchEnrichHandler(w http.ResponseWriter, r *http.Request) {
	adIDsParam := r.URL.Query().Get("ad_ids")
	if adIDsParam == "" {
		http.Error(w, "ad_ids required", http.StatusBadRequest)
		return
	}

	adIDs := strings.Split(adIDsParam, ",")
	log.Printf("Enriching batch of %d ads: %v", len(adIDs), adIDs)

	// Single latency hit for the whole batch
	simulateLatency()

	enrichments := make([]EnrichmentResponse, len(adIDs))
	for i, adID := range adIDs {
		enrichments[i] = EnrichmentResponse{
			AdID:        strings.TrimSpace(adID),
			BidPrice:    rand.Float64() * 2.0,
			Impressions: rand.Intn(10000),
		}
	}

	response := BatchResponse{Enrichments: enrichments}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// healthHandler for health checks
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	http.HandleFunc("/enrich", enrichHandler)
	http.HandleFunc("/enrich/batch", batchEnrichHandler)
	http.HandleFunc("/health", healthHandler)

	log.Printf("ad-provider starting on port %s (latency: %dms)", port, baseLatencyMs)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
