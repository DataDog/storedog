package datadog.kafka.example.producer.service;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

import datadog.kafka.example.proto.PurchaseProto.Purchase;
import com.google.protobuf.ByteString;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.stereotype.Service;

@Service
public class AutoProducerService {
    private static final Logger log = LoggerFactory.getLogger(AutoProducerService.class);
    private static final String PROTOBUF_TOPIC = "kafka-purchases";
    
    private final KafkaTemplate<String, byte[]> protobufTemplate;
    private final ConcurrentMap<String, AtomicLong> messageCounters = new ConcurrentHashMap<>();
    
    // Sample data for variety
    private static final List<String> CITIES = Arrays.asList("New York", "Los Angeles", "Chicago", "Houston", "Phoenix");
    private static final List<String> COUNTRIES = Arrays.asList("USA", "Canada", "Mexico", "Brazil", "Argentina");
    private static final Random RANDOM = new Random();

    public AutoProducerService() {
        String bootstrapServers = System.getenv("BOOTSTRAP");
        this.protobufTemplate = createKafkaTemplate(bootstrapServers);
    }

    /**
     * Creates and sends purchase messages to configured topics
     */
    public void produceMessages() {
        String outTopics = System.getenv("TOPICS_OUT");
        if (outTopics == null || outTopics.isEmpty()) {
            log.warn("No output topics configured");
            return;
        }

        for (String topic : outTopics.split(",")) {
            log.info("Producing message on topic: {}", topic);
            sendPurchaseMessage(topic);
        }
    }

    /**
     * Sends a purchase message to the specified topic
     */
    private void sendPurchaseMessage(String topic) {
        try {
            Purchase purchaseMessage = createPurchaseMessage(topic);
            byte[] serializedMessage = purchaseMessage.toByteArray();
            protobufTemplate.send(topic, serializedMessage);
            protobufTemplate.flush();
            
            logMessageCount(topic);
        } catch (Exception e) {
            log.error("Failed to send message to topic: {}", topic, e);
        }
    }

    /**
     * Creates a purchase message with appropriate fields based on current time
     */
    private Purchase createPurchaseMessage(String topic) {
        boolean isBadMessage = isBadMessageTime(topic);
        
        Purchase.Builder builder = Purchase.newBuilder()
                .setOrderId("12345")
                .setCustomerId("67890")
                .setOrderDate(System.currentTimeMillis());

        if (isBadMessage) {
            builder.setCity(getRandomCity());
        } else {
            builder.setCountry(getRandomCountry());
        }

        return builder.build();
    }

    /**
     * Determines if this should be a "bad" message (with city field) based on time
     */
    private boolean isBadMessageTime(String topic) {
        if (!PROTOBUF_TOPIC.equals(topic)) {
            return false;
        }
        
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        return now.getMinute() < 55; // Bad messages between 0-54 minutes
    }

    /**
     * Gets a random city for bad messages
     */
    private String getRandomCity() {
        return CITIES.get(RANDOM.nextInt(CITIES.size()));
    }

    /**
     * Gets a random country for good messages
     */
    private String getRandomCountry() {
        return COUNTRIES.get(RANDOM.nextInt(COUNTRIES.size()));
    }

    /**
     * Logs message count for monitoring (resets every 200 messages)
     */
    private void logMessageCount(String topic) {
        AtomicLong counter = messageCounters.computeIfAbsent(topic, k -> new AtomicLong(0));
        long count = counter.incrementAndGet();
        
        if (count == 200) {
            log.debug("200 messages sent on topic: {}, resetting counter", topic);
            counter.set(0L);
        }
    }

    /**
     * Creates and configures the Kafka template for protobuf messages
     */
    private KafkaTemplate<String, byte[]> createKafkaTemplate(String bootstrapServers) {
        Map<String, Object> configs = new HashMap<>();
        configs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configs.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        configs.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.ByteArraySerializer");
        
        ProducerFactory<String, byte[]> producerFactory = new DefaultKafkaProducerFactory<>(configs);
        return new KafkaTemplate<>(producerFactory);
    }
}
