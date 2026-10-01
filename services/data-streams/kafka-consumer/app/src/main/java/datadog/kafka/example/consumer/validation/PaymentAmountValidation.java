package datadog.kafka.example.consumer.validation;

import com.storedog.kafka.proto.OrderEvent;

public class PaymentAmountValidation implements OrderValidation {
    private final long maxAmountCents;

    public PaymentAmountValidation(long maxAmountCents) {
        this.maxAmountCents = maxAmountCents;
    }

    @Override
    public void validate(OrderEvent order) {
        long amountCents = order.getTotalAmount().getAmountCents();
        if (amountCents > maxAmountCents) {
            throw new IllegalArgumentException(
                "Payment amount " + amountCents + " exceeds the single-authorization limit of " + maxAmountCents);
        }
    }
}
