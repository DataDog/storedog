package datadog.kafka.example.producer.scheduling;

import datadog.kafka.example.producer.service.AutoProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    @Autowired
    private AutoProducerService autoProducerService;

    @Scheduled(fixedRate = 120)
    public void autoProduce() {
        autoProducerService.produceMessages();
    }
}
