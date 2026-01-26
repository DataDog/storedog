package datadog.kafka.example.producer.scheduling;

import datadog.kafka.example.producer.service.AutoProducerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);
    
    private final int messagesPerMinute;
    private final long intervalMs;

    @Autowired
    private AutoProducerService autoProducerService;

    public ScheduledTasks() {
        // Get messages per minute from environment (default: 60)
        String rateEnv = System.getenv("MESSAGES_PER_MINUTE");
        this.messagesPerMinute = (rateEnv != null && !rateEnv.isEmpty()) 
            ? Integer.parseInt(rateEnv) 
            : 60;
        
        // Calculate interval in milliseconds (60000ms per minute)
        this.intervalMs = 60000 / messagesPerMinute;
        
        log.info("Scheduled producer configured: {} messages/minute (every {}ms)", 
            messagesPerMinute, intervalMs);
    }

    @Scheduled(fixedRateString = "#{${MESSAGES_PER_MINUTE:60} == 0 ? 1000 : 60000 / ${MESSAGES_PER_MINUTE:60}}")
    public void autoProduce() {
        autoProducerService.produceMessages();
    }
}
