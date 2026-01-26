package datadog.kafka.example.producer.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

import com.storedog.kafka.proto.OrderEvent;
import com.storedog.kafka.proto.LineItem;
import com.storedog.kafka.proto.Money;
import com.storedog.kafka.proto.Address;
import com.storedog.kafka.proto.PaymentMethod;
import com.storedog.kafka.proto.Metadata;
import com.storedog.kafka.proto.OrderStatus;
import com.storedog.kafka.proto.PaymentType;
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
    
    private final KafkaTemplate<String, byte[]> protobufTemplate;
    private final ConcurrentMap<String, AtomicLong> messageCounters = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    // Sample data for realistic orders
    private static final List<Location> LOCATIONS = Arrays.asList(
        new Location("New York", "NY", "USA", "US", "10001"),
        new Location("Los Angeles", "CA", "USA", "US", "90001"),
        new Location("London", "England", "United Kingdom", "GB", "SW1A 1AA"),
        new Location("Paris", "Île-de-France", "France", "FR", "75001"),
        new Location("Tokyo", "Tokyo", "Japan", "JP", "100-0001"),
        new Location("Sydney", "NSW", "Australia", "AU", "2000")
    );
    
    private static final List<Product> PRODUCTS = Arrays.asList(
        new Product("prod-001", "Datadog T-Shirt", "TSHIRT-DD", 2999),
        new Product("prod-002", "Monitoring Handbook", "BOOK-MON", 4999),
        new Product("prod-003", "APM Coffee Mug", "MUG-APM", 1999),
        new Product("prod-004", "Laptop Sticker Pack", "STICKER-PACK", 999),
        new Product("prod-005", "Hoodie", "HOODIE-DD", 5999)
    );
    
    private static final List<PaymentType> PAYMENT_TYPES = Arrays.asList(
        PaymentType.PAYMENT_TYPE_CREDIT_CARD,
        PaymentType.PAYMENT_TYPE_DEBIT_CARD,
        PaymentType.PAYMENT_TYPE_PAYPAL,
        PaymentType.PAYMENT_TYPE_APPLE_PAY,
        PaymentType.PAYMENT_TYPE_GOOGLE_PAY
    );
    
    private static final List<String> CARD_BRANDS = Arrays.asList("Visa", "Mastercard", "Amex", "Discover");

    public AutoProducerService() {
        String bootstrapServers = System.getenv("BOOTSTRAP");
        if (bootstrapServers == null || bootstrapServers.isEmpty()) {
            bootstrapServers = "localhost:9092"; // fallback
        }
        this.protobufTemplate = createKafkaTemplate(bootstrapServers);
        log.info("AutoProducerService initialized with bootstrap servers: {}", bootstrapServers);
    }

    /**
     * Creates and sends order messages to configured topics
     */
    public void produceMessages() {
        String outTopics = System.getenv("TOPICS_OUT");
        if (outTopics == null || outTopics.isEmpty()) {
            log.warn("No output topics configured (TOPICS_OUT not set)");
            return;
        }

        for (String topic : outTopics.split(",")) {
            String trimmedTopic = topic.trim();
            if (!trimmedTopic.isEmpty()) {
                log.info("Producing order message on topic: {}", trimmedTopic);
                sendOrderMessage(trimmedTopic);
            }
        }
    }

    /**
     * Sends an order message to the specified topic
     */
    private void sendOrderMessage(String topic) {
        try {
            OrderEvent orderMessage = createOrderEvent();
            byte[] serializedMessage = orderMessage.toByteArray();
            protobufTemplate.send(topic, serializedMessage);
            protobufTemplate.flush();
            
            log.debug("Order {} sent to topic: {}", orderMessage.getOrderId(), topic);
            logMessageCount(topic);
        } catch (Exception e) {
            log.error("Failed to send order message to topic: {}", topic, e);
        }
    }

    /**
     * Creates a realistic order event
     */
    private OrderEvent createOrderEvent() {
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
        String customerId = "CUST-" + String.format("%06d", random.nextInt(1000000));
        long timestamp = System.currentTimeMillis();
        
        // Random location
        Location location = LOCATIONS.get(random.nextInt(LOCATIONS.size()));
        
        // Create 1-5 line items
        int numItems = 1 + random.nextInt(5);
        OrderEvent.Builder builder = OrderEvent.newBuilder()
            .setOrderId(orderId)
            .setCustomerId(customerId)
            .setTimestamp(timestamp)
            .setStatus(OrderStatus.ORDER_STATUS_CREATED)
            .setCurrency("USD");
        
        long totalAmountCents = 0;
        for (int i = 0; i < numItems; i++) {
            Product product = PRODUCTS.get(random.nextInt(PRODUCTS.size()));
            int quantity = 1 + random.nextInt(3);
            long itemTotalCents = product.priceCents * quantity;
            totalAmountCents += itemTotalCents;
            
            LineItem lineItem = LineItem.newBuilder()
                .setProductId(product.id)
                .setProductName(product.name)
                .setSku(product.sku)
                .setQuantity(quantity)
                .setUnitPrice(Money.newBuilder()
                    .setAmountCents(product.priceCents)
                    .setCurrency("USD")
                    .build())
                .setTotalPrice(Money.newBuilder()
                    .setAmountCents(itemTotalCents)
                    .setCurrency("USD")
                    .build())
                .build();
            
            builder.addItems(lineItem);
        }
        
        // Set total amount
        builder.setTotalAmount(Money.newBuilder()
            .setAmountCents(totalAmountCents)
            .setCurrency("USD")
            .build());
        
        // Create shipping address
        Address shippingAddress = Address.newBuilder()
            .setStreet(random.nextInt(9999) + " Main Street")
            .setCity(location.city)
            .setState(location.state)
            .setPostalCode(location.postalCode)
            .setCountry(location.country)
            .setCountryCode(location.countryCode)
            .build();
        
        builder.setShippingAddress(shippingAddress);
        builder.setBillingAddress(shippingAddress); // Same for simplicity
        
        // Create payment method
        PaymentType paymentType = PAYMENT_TYPES.get(random.nextInt(PAYMENT_TYPES.size()));
        String brand = CARD_BRANDS.get(random.nextInt(CARD_BRANDS.size()));
        String lastFour = String.format("%04d", random.nextInt(10000));
        
        PaymentMethod paymentMethod = PaymentMethod.newBuilder()
            .setType(paymentType)
            .setLastFour(lastFour)
            .setBrand(brand)
            .build();
        
        builder.setPaymentMethod(paymentMethod);
        
        // Add metadata
        Metadata metadata = Metadata.newBuilder()
            .setSource("web")
            .setSessionId("sess-" + UUID.randomUUID().toString())
            .setUserAgent("Mozilla/5.0 (Storedog/1.0)")
            .setIpAddress(randomIpAddress())
            .setReferrer("https://storedog.com")
            .build();
        
        builder.setMetadata(metadata);
        
        return builder.build();
    }

    /**
     * Generates a random IP address
     */
    private String randomIpAddress() {
        return String.format("%d.%d.%d.%d", 
            random.nextInt(256), 
            random.nextInt(256), 
            random.nextInt(256), 
            random.nextInt(256));
    }

    /**
     * Logs message count for monitoring (resets every 100 messages)
     */
    private void logMessageCount(String topic) {
        AtomicLong counter = messageCounters.computeIfAbsent(topic, k -> new AtomicLong(0));
        long count = counter.incrementAndGet();
        
        if (count % 100 == 0) {
            log.info("{} messages sent on topic: {}", count, topic);
        }
        
        if (count >= 1000) {
            log.debug("Resetting counter for topic: {}", topic);
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
        configs.put(ProducerConfig.ACKS_CONFIG, "1"); // Leader acknowledgment
        configs.put(ProducerConfig.RETRIES_CONFIG, 3);
        configs.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        configs.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        
        ProducerFactory<String, byte[]> producerFactory = new DefaultKafkaProducerFactory<>(configs);
        return new KafkaTemplate<>(producerFactory);
    }
    
    // Helper classes for data generation
    private static class Location {
        final String city;
        final String state;
        final String country;
        final String countryCode;
        final String postalCode;
        
        Location(String city, String state, String country, String countryCode, String postalCode) {
            this.city = city;
            this.state = state;
            this.country = country;
            this.countryCode = countryCode;
            this.postalCode = postalCode;
        }
    }
    
    private static class Product {
        final String id;
        final String name;
        final String sku;
        final long priceCents;
        
        Product(String id, String name, String sku, long priceCents) {
            this.id = id;
            this.name = name;
            this.sku = sku;
            this.priceCents = priceCents;
        }
    }
}
