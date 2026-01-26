package datadog.kafka.example.consumer;

import datadog.kafka.example.proto.PurchaseProto.Purchase;
import datadog.trace.api.DDTags;
import datadog.trace.api.profiling.Profiling;
import datadog.trace.api.profiling.ProfilingContextAttribute;
import datadog.trace.api.profiling.ProfilingScope;
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.google.protobuf.InvalidProtocolBufferException;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@ConditionalOnProperty(value = "secondConsumer", havingValue = "false", matchIfMissing = true)
public class FirstListener {
    private static final Logger log = LoggerFactory.getLogger(FirstListener.class);
    
    // Profiling context attributes
    private static final ProfilingContextAttribute COUNTRY_CONTEXT_ATTR = 
        Profiling.get().createContextAttribute("country");
    private static final ProfilingContextAttribute CITY_CONTEXT_ATTR = 
        Profiling.get().createContextAttribute("city");

    @Autowired
    private KafkaTemplate<String, byte[]> kafkaTemplate;

    @Value("#{'${app.enableCrashes}'}")
    private boolean enableCrashes;

    private final String outTopics = System.getenv("TOPICS_OUT");
    private final int crashStartMin = Utils.getEnvInt("CRASH_START_MIN", -1);
    private final int crashEndMin = Utils.getEnvInt("CRASH_END_MIN", -1);
    private final String serviceName = System.getenv("DD_SERVICE");

    @KafkaListener(groupId = "#{'${spring.kafka.consumerGroup}'}", 
                   topics = "#{'${spring.kafka.inTopics}'.split(',')}")
    public void listen(byte[] messageBytes) throws InterruptedException {
        Tracer tracer = GlobalOpenTelemetry.getTracer("consumer");
        Span span = createSpan(tracer);
        
        try (Scope scope = span.makeCurrent(); 
             ProfilingScope profilingScope = Profiling.get().newScope()) {
            
            // Deserialize the protobuf message
            Purchase message = deserializeMessage(messageBytes, span);
            if (message != null) {
                processMessage(message, span, profilingScope);
            }
            
        } catch (Exception e) {
            log.error("Error processing message", e);
            span.recordException(e);
        } finally {
            span.end();
        }
    }

    /**
     * Deserializes byte array to protobuf message
     */
    private Purchase deserializeMessage(byte[] messageBytes, Span span) {
        try {
            // Log raw message details for debugging
            log.info("Received message bytes - Length: {}, Hex: {}", 
                    messageBytes.length, bytesToHex(messageBytes));
            
            // Attempt deserialization
            Purchase message = Purchase.parseFrom(messageBytes);
            
            // Log successful deserialization with field details
            log.info("✅ Successfully deserialized protobuf message:");
            log.info("   - Order ID: {}", message.getOrderId());
            log.info("   - Customer ID: {}", message.getCustomerId());
            log.info("   - Order Date: {}", message.getOrderDate());
            log.info("   - City: '{}' (empty: {})", message.getCity(), message.getCity().isEmpty());
            log.info("   - Country: '{}' (empty: {})", message.getCountry(), message.getCountry().isEmpty());
            
            // Set span attributes for tracing
            span.setAttribute("message.order_id", message.getOrderId());
            span.setAttribute("message.customer_id", message.getCustomerId());
            span.setAttribute("message.order_date", message.getOrderDate());
            span.setAttribute("message.city", message.getCity());
            span.setAttribute("message.country", message.getCountry());
            span.setAttribute("message.bytes_length", messageBytes.length);
            
            return message;
            
        } catch (InvalidProtocolBufferException e) {
            log.error("❌ Failed to deserialize protobuf message", e);
            log.error("   - Message bytes length: {}", messageBytes.length);
            log.error("   - Message bytes hex: {}", bytesToHex(messageBytes));
            log.error("   - Error details: {}", e.getMessage());
            
            // Set error attributes on span
            span.setAttribute("error", true);
            span.setAttribute(DDTags.ERROR_MSG, "Failed to deserialize protobuf message: " + e.getMessage());
            span.setAttribute("error.bytes_length", messageBytes.length);
            span.setAttribute("error.bytes_hex", bytesToHex(messageBytes));
            
            return null;
        } catch (Exception e) {
            log.error("❌ Unexpected error during deserialization", e);
            log.error("   - Message bytes length: {}", messageBytes.length);
            log.error("   - Message bytes hex: {}", bytesToHex(messageBytes));
            
            // Set error attributes on span
            span.setAttribute("error", true);
            span.setAttribute(DDTags.ERROR_MSG, "Unexpected error during deserialization: " + e.getMessage());
            span.setAttribute("error.bytes_length", messageBytes.length);
            span.setAttribute("error.bytes_hex", bytesToHex(messageBytes));
            
            return null;
        }
    }

    /**
     * Converts byte array to hex string for logging
     */
    private String bytesToHex(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return "null/empty";
        }
        
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        
        // Limit hex output to first 100 characters to avoid log flooding
        if (hex.length() > 100) {
            return hex.substring(0, 100) + "...";
        }
        return hex.toString();
    }

    /**
     * Creates the OpenTelemetry span for tracing
     */
    private Span createSpan(Tracer tracer) {
        return tracer.spanBuilder("kafka.Listen")
                .setAttribute(DDTags.RESOURCE_NAME, serviceName + ".listen")
                .setAttribute(DDTags.SERVICE_NAME, serviceName)
                .startSpan();
    }

    /**
     * Main message processing logic
     */
    private void processMessage(Purchase message, Span span, ProfilingScope profilingScope) {
        String messageId = UUID.randomUUID().toString();
        log.info("🔄 Processing message: {}", messageId);

        // Extract message fields
        MessageFields fields = extractMessageFields(message);
        
        // Log comprehensive message details
        logMessageDetails(fields, messageId);
        
        // Set profiling context
        setProfilingContext(profilingScope, fields);
        
        // Handle special service logic
        if (isTradeExecutorService()) {
            logTradeExecutorInfo(messageId, fields);
        }
        
        // Forward message to downstream topics
        forwardMessageToDownstreamTopics(message, span);
        
        log.info("✅ Successfully processed message: {}", messageId);
    }

    /**
     * Forwards the processed message to all configured downstream topics
     */
    private void forwardMessageToDownstreamTopics(Purchase message, Span span) {
        if (outTopics == null || outTopics.isEmpty()) {
            log.debug("No downstream topics configured, skipping forwarding");
            return;
        }

        String[] topics = outTopics.split(",");
        log.info("Forwarding message to {} downstream topics: {}", topics.length, outTopics);

        for (String topic : topics) {
            String trimmedTopic = topic.trim();
            if (!trimmedTopic.isEmpty()) {
                try {
                    // Serialize the protobuf message to bytes for forwarding
                    byte[] messageBytes = message.toByteArray();
                    
                    // Send to downstream topic
                    kafkaTemplate.send(trimmedTopic, messageBytes);
                    kafkaTemplate.flush();
                    
                    log.info("✅ Successfully forwarded message to topic: {}", trimmedTopic);
                    
                    // Set span attributes for tracing
                    span.setAttribute("forwarded.topic", trimmedTopic);
                    span.setAttribute("forwarded.success", true);
                    
                } catch (Exception e) {
                    log.error("❌ Failed to forward message to topic: {}", trimmedTopic, e);
                    
                    // Set error attributes on span
                    span.setAttribute("forwarded.topic", trimmedTopic);
                    span.setAttribute("forwarded.success", false);
                    span.setAttribute("forwarded.error", e.getMessage());
                }
            }
        }
    }

    /**
     * Extracts and validates message fields
     */
    private MessageFields extractMessageFields(Purchase message) {
        boolean hasCity = !message.getCity().isEmpty();
        boolean hasCountry = !message.getCountry().isEmpty();
        
        String cityValue = hasCity ? message.getCity() : "Pleasanton";
        String countryValue = hasCountry ? message.getCountry() : "USA";
        
        // Log field extraction details
        log.debug("Field extraction - City: '{}' (hasCity: {}), Country: '{}' (hasCountry: {})", 
                 message.getCity(), hasCity, message.getCountry(), hasCountry);
        
        return new MessageFields(hasCity, hasCountry, cityValue, countryValue);
    }

    /**
     * Logs message details for monitoring
     */
    private void logMessageDetails(MessageFields fields, String messageId) {
        log.info("📋 Message {} details:", messageId);
        log.info("   - City: '{}' (original: {})", fields.cityValue, fields.hasCity ? "present" : "defaulted");
        log.info("   - Country: '{}' (original: {})", fields.countryValue, fields.hasCountry ? "present" : "defaulted");
        
        // Console output for immediate visibility
        System.out.println("consume city: " + fields.cityValue);
        System.out.println("consume country: " + fields.countryValue);
    }

    /**
     * Sets profiling context attributes
     */
    private void setProfilingContext(ProfilingScope profilingScope, MessageFields fields) {
        profilingScope.setContextValue(COUNTRY_CONTEXT_ATTR, fields.countryValue);
        profilingScope.setContextValue(CITY_CONTEXT_ATTR, fields.cityValue);
    }

    /**
     * Logs trade executor specific information
     */
    private void logTradeExecutorInfo(String messageId, MessageFields fields) {
        String fraudCode = generateFraudCode();
        String ruleViolation = generateRuleViolation();
        
        System.out.printf("fraud_code: %s, rule_violation: %s, status: info, " +
                         "message: transaction analyzed: %s, ID for country code: %s, fraud detected: no%n",
                         fraudCode, ruleViolation, messageId, fields.countryValue);
    }

    /**
     * Generates a random fraud code
     */
    private String generateFraudCode() {
        return "FRD00" + (int) (Math.random() * 10);
    }

    /**
     * Generates a random rule violation code
     */
    private String generateRuleViolation() {
        return "RL0" + (int) (Math.random() * 30 + 10);
    }

    /**
     * Checks if this is the trade-executor service
     */
    private boolean isTradeExecutorService() {
        return serviceName != null && serviceName.toLowerCase().contains("trade-executor");
    }

    /**
     * Data class to hold extracted message fields
     */
    private static class MessageFields {
        final boolean hasCity;
        final boolean hasCountry;
        final String cityValue;
        final String countryValue;

        MessageFields(boolean hasCity, boolean hasCountry, String cityValue, String countryValue) {
            this.hasCity = hasCity;
            this.hasCountry = hasCountry;
            this.cityValue = cityValue;
            this.countryValue = countryValue;
        }
    }
}
