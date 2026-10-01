package com.storedog.webhook;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebhookApplication {
    private static final Logger log = LoggerFactory.getLogger(WebhookApplication.class);

    public static void main(String[] args) {
        log.info("Starting Order Webhook Bridge");
        log.info("Listening on port: {}", System.getenv().getOrDefault("SERVER_PORT", "8081"));
        log.info("Kafka Bootstrap: {}", System.getenv().getOrDefault("BOOTSTRAP", "localhost:9092"));
        log.info("Output Topics: {}", System.getenv().getOrDefault("TOPICS_OUT", "order-events"));
        
        SpringApplication.run(WebhookApplication.class, args);
    }
}
