package datadog.kafka.example.consumer.validation;

import com.storedog.kafka.proto.OrderEvent;

import java.util.regex.Pattern;

public class ShippingCountryValidation implements OrderValidation {
    private static final Pattern ISO_ALPHA2 = Pattern.compile("^[A-Z]{2}$");

    @Override
    public void validate(OrderEvent order) {
        String countryCode = order.getShippingAddress().getCountryCode();
        if (!ISO_ALPHA2.matcher(countryCode).matches()) {
            throw new IllegalStateException(
                "Shipping address country_code is not a valid ISO 3166-1 alpha-2 code: " + countryCode);
        }
    }
}
