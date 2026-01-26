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

    @Autowired
    private AutoProducerService autoProducerService;

    public ScheduledTasks() {
        // Get messages per minute from environment (default: 60)
        String rateEnv = System.getenv("MESSAGES_PER_MINUTE");
        this.messagesPerMinute = (rateEnv != null && !rateEnv.isEmpty()) 
            ? Integer.parseInt(rateEnv) 
            : 60;
        
        log.info("Scheduled producer configured: {} messages/minute (interval: {}ms)", 
            messagesPerMinute, getIntervalMs());
    }
    
    // Public getter for SpEL access in @Scheduled
    public long getIntervalMs() {
        return this.messagesPerMinute > 0 ? (60000 / messagesPerMinute) : 1000;
    }

    @Scheduled(fixedRateString = "#{__listener.intervalMs}")
    public void autoProduce() {
        autoProducerService.produceMessages();
    }
}
