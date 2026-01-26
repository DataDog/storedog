package datadog.kafka.example.consumer;

import com.storedog.kafka.proto.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.google.protobuf.InvalidProtocolBufferException;

import java.util.Random;
import java.util.UUID;

@Component
public class MessageListener {
    private static final Logger log = LoggerFactory.getLogger(MessageListener.class);
    
    @Autowired
    private KafkaTemplate<String, byte[]> kafkaTemplate;

    private final String serviceName = System.getenv().getOrDefault("DD_SERVICE_NAME", "unknown");
    private final String outTopics = System.getenv("TOPICS_OUT");
    private final int processingTimeMin = getEnvInt("PROCESSING_TIME_MS_MIN", 50);
    private final int processingTimeMax = getEnvInt("PROCESSING_TIME_MS_MAX", 100);
    private final int errorRatePercent = getEnvInt("ERROR_RATE_PERCENT", 0);
    
    private final Random random = new Random();
    
    // Public getters for SpEL access in @KafkaListener
    public String getConsumerGroup() {
        return System.getenv().getOrDefault("CONSUMER_GROUP", "default-group");
    }
    
    public String getInTopics() {
        return System.getenv().getOrDefault("TOPICS_IN", "");
    }

    @KafkaListener(groupId = "#{__listener.consumerGroup}", 
                   topics = "#{__listener.inTopics.split(',')}")
    public void listen(byte[] messageBytes) {
        String messageId = UUID.randomUUID().toString().substring(0, 8);
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("[{}] Received message ({} bytes)", messageId, messageBytes.length);
            
            // Deserialize the protobuf message
            OrderEvent message = deserializeMessage(messageBytes);
            if (message == null) {
                log.error("[{}] Failed to deserialize message, skipping", messageId);
                return;
            }
            
            // Log order details
            log.info("[{}] Processing order: {} for customer: {}", 
                messageId, message.getOrderId(), message.getCustomerId());
            
            // Simulate processing time
            simulateProcessing();
            
            // Simulate errors based on configuration
            if (shouldSimulateError()) {
                log.error("[{}] Simulated error during processing (error rate: {}%)", 
                    messageId, errorRatePercent);
                // In real scenario, would route to error topic
                return;
            }
            
            // Forward message to downstream topics
            forwardMessageToDownstreamTopics(messageBytes, message.getOrderId());
            
            long processingTime = System.currentTimeMillis() - startTime;
            log.info("[{}] Successfully processed in {}ms", messageId, processingTime);
            
        } catch (Exception e) {
            log.error("[{}] Error processing message", messageId, e);
        }
    }

    /**
     * Deserializes byte array to OrderEvent protobuf message
     */
    private OrderEvent deserializeMessage(byte[] messageBytes) {
        try {
            OrderEvent message = OrderEvent.parseFrom(messageBytes);
            
            log.debug("Successfully deserialized OrderEvent:");
            log.debug("  - Order ID: {}", message.getOrderId());
            log.debug("  - Customer ID: {}", message.getCustomerId());
            log.debug("  - Status: {}", message.getStatus());
            log.debug("  - Items: {}", message.getItemsCount());
            
            return message;
            
        } catch (InvalidProtocolBufferException e) {
            log.error("Failed to deserialize protobuf message", e);
            log.error("  - Message bytes length: {}", messageBytes.length);
            return null;
        }
    }

    /**
     * Forwards the processed message to all configured downstream topics
     */
    private void forwardMessageToDownstreamTopics(byte[] messageBytes, String orderId) {
        if (outTopics == null || outTopics.isEmpty()) {
            log.debug("No downstream topics configured, message processing complete");
            return;
        }

        String[] topics = outTopics.split(",");
        log.info("Forwarding order {} to {} downstream topics", orderId, topics.length);

        for (String topic : topics) {
            String trimmedTopic = topic.trim();
            if (!trimmedTopic.isEmpty()) {
                try {
                    // Forward the same message to downstream topic
                    kafkaTemplate.send(trimmedTopic, messageBytes);
                    kafkaTemplate.flush();
                    
                    log.info("✓ Forwarded to topic: {}", trimmedTopic);
                    
                } catch (Exception e) {
                    log.error("✗ Failed to forward to topic: {}", trimmedTopic, e);
                }
            }
        }
    }

    /**
     * Simulates processing time based on configuration
     */
    private void simulateProcessing() throws InterruptedException {
        if (processingTimeMax > 0 && processingTimeMax >= processingTimeMin) {
            int processingTime = processingTimeMin + 
                random.nextInt(processingTimeMax - processingTimeMin + 1);
            Thread.sleep(processingTime);
        }
    }

    /**
     * Determines if an error should be simulated based on configured error rate
     */
    private boolean shouldSimulateError() {
        if (errorRatePercent <= 0) {
            return false;
        }
        return random.nextInt(100) < errorRatePercent;
    }

    /**
     * Gets an integer from environment variable with default value
     */
    private static int getEnvInt(String name, int defaultVal) {
        String value = System.getenv(name);
        if (value == null || value.isEmpty()) {
            return defaultVal;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}
