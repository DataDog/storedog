package datadog.kafka.example.consumer.validation;

import com.storedog.kafka.proto.OrderEvent;

public interface OrderValidation {
    void validate(OrderEvent order);
}
