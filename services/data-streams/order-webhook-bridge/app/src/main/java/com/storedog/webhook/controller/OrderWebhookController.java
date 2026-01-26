package com.storedog.webhook.controller;

import com.storedog.kafka.proto.OrderEvent;
import com.storedog.webhook.model.StoredogOrderPayload;
import com.storedog.webhook.service.OrderTransformer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class OrderWebhookController {
    private static final Logger log = LoggerFactory.getLogger(OrderWebhookController.class);

    @Autowired
    private KafkaTemplate<String, byte[]> kafkaTemplate;

    @Autowired
    private OrderTransformer orderTransformer;

    private final String outTopics = System.getenv().getOrDefault("TOPICS_OUT", "order-events");

    /**
     * Webhook endpoint for Storedog order creation
     */
    @PostMapping("/webhooks/order-created")
    public ResponseEntity<Map<String, String>> handleOrderCreated(
        @RequestBody StoredogOrderPayload payload
    ) {
        String orderId = payload.getOrderId();
        log.info("=== Received webhook for order: {} ===", orderId);
        log.info("Customer: {}, Email: {}", payload.getCustomerId(), payload.getEmail());
        log.info("Items: {}, Total: {} {}", 
            payload.getItems() != null ? payload.getItems().size() : 0,
            payload.getTotalCents() != null ? payload.getTotalCents() / 100.0 : 0.0,
            payload.getCurrency());

        try {
            // Transform JSON to OrderEvent protobuf
            OrderEvent orderEvent = orderTransformer.transform(payload);
            byte[] serializedMessage = orderEvent.toByteArray();

            // Produce to Kafka
            String[] topics = outTopics.split(",");
            for (String topic : topics) {
                String trimmedTopic = topic.trim();
                if (!trimmedTopic.isEmpty()) {
                    kafkaTemplate.send(trimmedTopic, serializedMessage);
                    log.info("✓ Sent order {} to Kafka topic: {}", orderId, trimmedTopic);
                }
            }
            
            kafkaTemplate.flush();

            Map<String, String> response = new HashMap<>();
            response.put("status", "accepted");
            response.put("order_id", orderId);
            response.put("message", "Order event sent to Kafka");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("✗ Failed to process webhook for order: {}", orderId, e);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("order_id", orderId);
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "order-webhook-bridge");
        response.put("topics", outTopics);
        return response;
    }

    /**
     * Test endpoint for manual webhook testing
     */
    @PostMapping("/webhooks/test")
    public ResponseEntity<Map<String, String>> testWebhook() {
        log.info("Test webhook triggered");
        
        // Create a minimal test payload
        StoredogOrderPayload testPayload = new StoredogOrderPayload();
        testPayload.setOrderId("TEST-" + System.currentTimeMillis());
        testPayload.setCustomerId("TEST-CUSTOMER");
        testPayload.setEmail("test@storedog.com");
        testPayload.setTotalCents(9999L);
        testPayload.setCurrency("USD");
        
        return handleOrderCreated(testPayload);
    }
}
