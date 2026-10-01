package datadog.kafka.example.consumer.validation;

import datadog.kafka.example.common.Utils;

public final class OrderValidations {
    private static final long DEFAULT_MAX_PAYMENT_AMOUNT_CENTS = 30000;

    private OrderValidations() {
    }

    public static OrderValidation fromEnvironment() {
        String mode = Utils.getEnvString("VALIDATION_MODE", "none");
        switch (mode) {
            case "shipping-country":
                return new ShippingCountryValidation();
            case "payment-amount":
                long maxAmountCents = Utils.getEnvInt("MAX_PAYMENT_AMOUNT_CENTS", (int) DEFAULT_MAX_PAYMENT_AMOUNT_CENTS);
                return new PaymentAmountValidation(maxAmountCents);
            default:
                return order -> { };
        }
    }
}
