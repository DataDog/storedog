package datadog.kafka.example.consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ConsumerApplication {
    private static final Logger log = LoggerFactory.getLogger(ConsumerApplication.class);
    
    public static void main(String[] args) {
        log.info("Starting Storedog Data Streams Consumer");
        log.info("Service: {}", System.getenv().getOrDefault("DD_SERVICE_NAME", "unknown"));
        log.info("Topics IN: {}", System.getenv().getOrDefault("TOPICS_IN", "not configured"));
        log.info("Topics OUT: {}", System.getenv().getOrDefault("TOPICS_OUT", "none (terminal consumer)"));
        log.info("Consumer Group: {}", System.getenv().getOrDefault("CONSUMER_GROUP", "not configured"));
        log.info("Kafka Bootstrap: {}", System.getenv().getOrDefault("KAFKA_CONSUME_SERVER", "not configured"));
        
        SpringApplication.run(ConsumerApplication.class, args);
    }
}
