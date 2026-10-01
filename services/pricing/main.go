package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

// PricingRule defines a pricing rule for products
type PricingRule struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"` // "percentage", "fixed", "bulk", "tiered"
	Value       float64 `json:"value"`
	MinQuantity int     `json:"min_quantity,omitempty"`
	MaxQuantity int     `json:"max_quantity,omitempty"`
	ProductIDs  []int   `json:"product_ids,omitempty"` // empty means applies to all
	Active      bool    `json:"active"`
}

// CalculateRequest represents a single item price calculation request
type CalculateRequest struct {
	ProductID    int     `json:"product_id"`
	BasePrice    float64 `json:"base_price"`
	Quantity     int     `json:"quantity"`
	DiscountCode string  `json:"discount_code,omitempty"`
}

// CalculateResponse represents the calculated price response
type CalculateResponse struct {
	ProductID     int     `json:"product_id"`
	BasePrice     float64 `json:"base_price"`
	Quantity      int     `json:"quantity"`
	UnitPrice     float64 `json:"unit_price"`
	TotalPrice    float64 `json:"total_price"`
	Discount      float64 `json:"discount"`
	RulesApplied  []string `json:"rules_applied"`
	CalculatedAt  string  `json:"calculated_at"`
}

// CartItem represents an item in the cart
type CartItem struct {
	ProductID int     `json:"product_id"`
	Name      string  `json:"name,omitempty"`
	BasePrice float64 `json:"base_price"`
	Quantity  int     `json:"quantity"`
}

// CartRequest represents a full cart calculation request
type CartRequest struct {
	Items        []CartItem `json:"items"`
	DiscountCode string     `json:"discount_code,omitempty"`
	Subtotal     float64    `json:"subtotal,omitempty"`
}

// CartItemResult represents the calculated price for a cart item
type CartItemResult struct {
	ProductID    int      `json:"product_id"`
	Name         string   `json:"name,omitempty"`
	BasePrice    float64  `json:"base_price"`
	Quantity     int      `json:"quantity"`
	UnitPrice    float64  `json:"unit_price"`
	LineTotal    float64  `json:"line_total"`
	Discount     float64  `json:"discount"`
	RulesApplied []string `json:"rules_applied"`
}

// CartResponse represents the full cart calculation response
type CartResponse struct {
	Items           []CartItemResult `json:"items"`
	Subtotal        float64          `json:"subtotal"`
	TotalDiscount   float64          `json:"total_discount"`
	Total           float64          `json:"total"`
	DiscountCode    string           `json:"discount_code,omitempty"`
	DiscountApplied bool             `json:"discount_applied"`
	RulesApplied    []string         `json:"rules_applied"`
	CalculatedAt    string           `json:"calculated_at"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

// In-memory pricing rules (in production, this would come from a database)
var pricingRules = []PricingRule{
	{
		ID:          "bulk-5",
		Name:        "Bulk Discount 5+",
		Type:        "percentage",
		Value:       5.0,
		MinQuantity: 5,
		Active:      true,
	},
	{
		ID:          "bulk-10",
		Name:        "Bulk Discount 10+",
		Type:        "percentage",
		Value:       10.0,
		MinQuantity: 10,
		Active:      true,
	},
	{
		ID:          "bulk-25",
		Name:        "Bulk Discount 25+",
		Type:        "percentage",
		Value:       15.0,
		MinQuantity: 25,
		Active:      true,
	},
}

// applyPricingRules calculates the price for an item based on active rules
func applyPricingRules(productID int, basePrice float64, quantity int) (float64, float64, []string) {
	unitPrice := basePrice
	totalDiscount := 0.0
	appliedRules := []string{}

	// Find the best applicable bulk discount
	var bestRule *PricingRule
	for i := range pricingRules {
		rule := &pricingRules[i]
		if !rule.Active {
			continue
		}

		// Check if rule applies to this product
		if len(rule.ProductIDs) > 0 {
			found := false
			for _, pid := range rule.ProductIDs {
				if pid == productID {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}

		// Check quantity requirements
		if rule.MinQuantity > 0 && quantity < rule.MinQuantity {
			continue
		}
		if rule.MaxQuantity > 0 && quantity > rule.MaxQuantity {
			continue
		}

		// Use the best rule (highest discount for bulk)
		if bestRule == nil || (rule.Type == "percentage" && rule.Value > bestRule.Value) {
			bestRule = rule
		}
	}

	// Apply the best rule
	if bestRule != nil {
		switch bestRule.Type {
		case "percentage":
			discount := basePrice * (bestRule.Value / 100.0)
			unitPrice = basePrice - discount
			totalDiscount = discount * float64(quantity)
			appliedRules = append(appliedRules, bestRule.Name)
		case "fixed":
			unitPrice = basePrice - bestRule.Value
			if unitPrice < 0 {
				unitPrice = 0
			}
			totalDiscount = bestRule.Value * float64(quantity)
			appliedRules = append(appliedRules, bestRule.Name)
		}
	}

	return unitPrice, totalDiscount, appliedRules
}

// healthHandler handles health check requests
func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Service:   "pricing",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// calculateHandler handles single item price calculations
func calculateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CalculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	unitPrice, discount, rulesApplied := applyPricingRules(req.ProductID, req.BasePrice, req.Quantity)
	totalPrice := unitPrice * float64(req.Quantity)

	response := CalculateResponse{
		ProductID:    req.ProductID,
		BasePrice:    req.BasePrice,
		Quantity:     req.Quantity,
		UnitPrice:    unitPrice,
		TotalPrice:   totalPrice,
		Discount:     discount,
		RulesApplied: rulesApplied,
		CalculatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	log.Printf("Calculated price for product %d: quantity=%d, base=%.2f, unit=%.2f, total=%.2f",
		req.ProductID, req.Quantity, req.BasePrice, unitPrice, totalPrice)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// calculateCartHandler handles full cart calculations
func calculateCartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CartRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var items []CartItemResult
	var subtotal, totalDiscount float64
	allRulesApplied := make(map[string]bool)

	for _, item := range req.Items {
		if item.Quantity <= 0 {
			item.Quantity = 1
		}

		unitPrice, discount, rulesApplied := applyPricingRules(item.ProductID, item.BasePrice, item.Quantity)
		lineTotal := unitPrice * float64(item.Quantity)

		for _, rule := range rulesApplied {
			allRulesApplied[rule] = true
		}

		items = append(items, CartItemResult{
			ProductID:    item.ProductID,
			Name:         item.Name,
			BasePrice:    item.BasePrice,
			Quantity:     item.Quantity,
			UnitPrice:    unitPrice,
			LineTotal:    lineTotal,
			Discount:     discount,
			RulesApplied: rulesApplied,
		})

		subtotal += lineTotal
		totalDiscount += discount
	}

	// Convert map to slice
	var rulesSlice []string
	for rule := range allRulesApplied {
		rulesSlice = append(rulesSlice, rule)
	}

	response := CartResponse{
		Items:           items,
		Subtotal:        subtotal,
		TotalDiscount:   totalDiscount,
		Total:           subtotal,
		DiscountCode:    req.DiscountCode,
		DiscountApplied: req.DiscountCode != "",
		RulesApplied:    rulesSlice,
		CalculatedAt:    time.Now().UTC().Format(time.RFC3339),
	}

	log.Printf("Calculated cart: items=%d, subtotal=%.2f, discount=%.2f, total=%.2f",
		len(req.Items), subtotal, totalDiscount, response.Total)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// rulesHandler returns current pricing rules
func rulesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Return only active rules
	var activeRules []PricingRule
	for _, rule := range pricingRules {
		if rule.Active {
			activeRules = append(activeRules, rule)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activeRules)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "5001"
	}

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/calculate", calculateHandler)
	http.HandleFunc("/calculate/cart", calculateCartHandler)
	http.HandleFunc("/rules", rulesHandler)

	log.Printf("Pricing service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
