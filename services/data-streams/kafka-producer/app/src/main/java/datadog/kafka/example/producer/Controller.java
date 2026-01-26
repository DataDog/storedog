package datadog.kafka.example.producer;

import com.storedog.kafka.proto.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class Controller {
    private final Logger log = LoggerFactory.getLogger(Controller.class);

    @Autowired
    private KafkaTemplate<String, byte[]> template;

    @PostMapping(path = "/send/{topic}/{messageId}")
    public Map<String, String> sendMessage(@PathVariable String topic, @PathVariable String messageId) {
        log.info("Manual trigger: Sending test message {} to topic: {}", messageId, topic);
        
        try {
            // Create a simple test order
            OrderEvent testOrder = OrderEvent.newBuilder()
                .setOrderId("TEST-" + messageId)
                .setCustomerId("CUST-TEST")
                .setTimestamp(System.currentTimeMillis())
                .build();
            
            byte[] bytes = testOrder.toByteArray();
            template.send(topic, bytes);
            template.flush();
            
            log.info("Successfully sent test message {} to topic: {}", messageId, topic);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("topic", topic);
            response.put("messageId", messageId);
            return response;
        } catch (Exception e) {
            log.error("Failed to send test message to topic: {}", topic, e);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("error", e.getMessage());
            return response;
        }
    }
    
    @GetMapping(path = "/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", System.getenv().getOrDefault("DD_SERVICE_NAME", "producer"));
        response.put("topics", System.getenv().getOrDefault("TOPICS_OUT", "not configured"));
        return response;
    }
}
