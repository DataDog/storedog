package com.storedog.webhook.service;

import com.storedog.kafka.proto.*;
import com.storedog.webhook.model.StoredogOrderPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class OrderTransformer {
    private static final Logger log = LoggerFactory.getLogger(OrderTransformer.class);

    /**
     * Transforms Storedog JSON payload to OrderEvent protobuf
     */
    public OrderEvent transform(StoredogOrderPayload payload) {
        log.info("Transforming order: {} from Storedog to protobuf", payload.getOrderId());
        
        OrderEvent.Builder builder = OrderEvent.newBuilder()
            .setOrderId(payload.getOrderId())
            .setCustomerId(payload.getCustomerId() != null ? payload.getCustomerId() : "guest")
            .setTimestamp(parseTimestamp(payload.getCompletedAt()))
            .setStatus(OrderStatus.ORDER_STATUS_CREATED)
            .setCurrency(payload.getCurrency() != null ? payload.getCurrency() : "USD");

        // Add total amount
        if (payload.getTotalCents() != null) {
            builder.setTotalAmount(Money.newBuilder()
                .setAmountCents(payload.getTotalCents())
                .setCurrency(payload.getCurrency() != null ? payload.getCurrency() : "USD")
                .build());
        }

        // Add line items
        if (payload.getItems() != null) {
            for (StoredogOrderPayload.LineItem item : payload.getItems()) {
                LineItem lineItem = LineItem.newBuilder()
                    .setProductId(item.getProductId())
                    .setProductName(item.getProductName())
                    .setSku(item.getSku() != null ? item.getSku() : "")
                    .setQuantity(item.getQuantity())
                    .setUnitPrice(Money.newBuilder()
                        .setAmountCents(item.getUnitPriceCents())
                        .setCurrency(payload.getCurrency() != null ? payload.getCurrency() : "USD")
                        .build())
                    .setTotalPrice(Money.newBuilder()
                        .setAmountCents(item.getUnitPriceCents() * item.getQuantity())
                        .setCurrency(payload.getCurrency() != null ? payload.getCurrency() : "USD")
                        .build())
                    .build();
                
                builder.addItems(lineItem);
            }
        }

        // Add shipping address
        if (payload.getShippingAddress() != null) {
            builder.setShippingAddress(transformAddress(payload.getShippingAddress()));
        }

        // Add billing address
        if (payload.getBillingAddress() != null) {
            builder.setBillingAddress(transformAddress(payload.getBillingAddress()));
        } else if (payload.getShippingAddress() != null) {
            // Use shipping as billing if not provided
            builder.setBillingAddress(transformAddress(payload.getShippingAddress()));
        }

        // Add payment method
        if (payload.getPaymentMethod() != null) {
            builder.setPaymentMethod(PaymentMethod.newBuilder()
                .setType(parsePaymentType(payload.getPaymentMethod()))
                .setBrand(payload.getPaymentMethod())
                .setLastFour("0000") // Not provided by Storedog
                .build());
        }

        // Add metadata
        Metadata metadata = Metadata.newBuilder()
            .setSource("storedog-web")
            .setSessionId("storedog-" + payload.getOrderId())
            .setUserAgent("Storedog/1.0")
            .setIpAddress("0.0.0.0") // Not provided by webhook
            .setReferrer("https://storedog.com")
            .build();
        
        builder.setMetadata(metadata);

        OrderEvent orderEvent = builder.build();
        log.info("Transformed order {} with {} items, total: {} {}",
            orderEvent.getOrderId(),
            orderEvent.getItemsCount(),
            orderEvent.getTotalAmount().getAmountCents() / 100.0,
            orderEvent.getCurrency());
        
        return orderEvent;
    }

    private Address transformAddress(StoredogOrderPayload.Address addr) {
        return Address.newBuilder()
            .setStreet(addr.getStreet() != null ? addr.getStreet() : "")
            .setCity(addr.getCity() != null ? addr.getCity() : "")
            .setState(addr.getState() != null ? addr.getState() : "")
            .setPostalCode(addr.getPostalCode() != null ? addr.getPostalCode() : "")
            .setCountry(addr.getCountry() != null ? addr.getCountry() : "")
            .setCountryCode(addr.getCountryCode() != null ? addr.getCountryCode() : "")
            .build();
    }

    private PaymentType parsePaymentType(String paymentMethod) {
        if (paymentMethod == null) {
            return PaymentType.PAYMENT_TYPE_UNKNOWN;
        }
        
        String method = paymentMethod.toLowerCase();
        if (method.contains("credit")) {
            return PaymentType.PAYMENT_TYPE_CREDIT_CARD;
        } else if (method.contains("debit")) {
            return PaymentType.PAYMENT_TYPE_DEBIT_CARD;
        } else if (method.contains("paypal")) {
            return PaymentType.PAYMENT_TYPE_PAYPAL;
        } else if (method.contains("apple")) {
            return PaymentType.PAYMENT_TYPE_APPLE_PAY;
        } else if (method.contains("google")) {
            return PaymentType.PAYMENT_TYPE_GOOGLE_PAY;
        } else {
            return PaymentType.PAYMENT_TYPE_CREDIT_CARD; // Default
        }
    }

    private long parseTimestamp(String completedAt) {
        if (completedAt == null || completedAt.isEmpty()) {
            return System.currentTimeMillis();
        }
        
        try {
            return Instant.parse(completedAt).toEpochMilli();
        } catch (Exception e) {
            log.warn("Failed to parse timestamp: {}, using current time", completedAt);
            return System.currentTimeMillis();
        }
    }
}
