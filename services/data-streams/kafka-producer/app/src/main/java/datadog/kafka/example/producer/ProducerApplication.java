package datadog.kafka.example.producer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProducerApplication {
    private static final Logger log = LoggerFactory.getLogger(ProducerApplication.class);

    public static void main(String[] args) {
        log.info("Starting Storedog Data Streams Producer");
        log.info("Service: {}", System.getenv().getOrDefault("DD_SERVICE_NAME", "unknown"));
        log.info("Topics: {}", System.getenv().getOrDefault("TOPICS_OUT", "not configured"));
        log.info("Kafka Bootstrap: {}", System.getenv().getOrDefault("BOOTSTRAP", "not configured"));
        
        SpringApplication.run(ProducerApplication.class, args);
    }
}
