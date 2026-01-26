package datadog.kafka.example.producer.scheduling;

import datadog.kafka.example.producer.service.AutoProducerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

@Configuration
public class ScheduledTasks implements SchedulingConfigurer {
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
        this.intervalMs = this.messagesPerMinute > 0 ? (60000 / messagesPerMinute) : 1000;
        
        log.info("Scheduled producer configured: {} messages/minute (interval: {}ms)", 
            messagesPerMinute, intervalMs);
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.addFixedRateTask(
            () -> autoProducerService.produceMessages(),
            intervalMs
        );
        log.info("Scheduled task registered with {}ms interval", intervalMs);
    }
}
