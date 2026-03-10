package adsjava;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import java.io.*;
import org.springframework.web.bind.annotation.ResponseBody;
import org.apache.commons.io.IOUtils;
import java.util.concurrent.ThreadLocalRandom;
import java.util.HashMap;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.concurrent.TimeoutException;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.MDC;

// OpenTelemetry imports for manual tracing
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.LongHistogram;
import io.opentelemetry.api.metrics.Meter;


@SpringBootApplication
@RestController
public class AdsJavaApplication {

    private static final Logger logger = LoggerFactory.getLogger(AdsJavaApplication.class);
    private static final Tracer tracer = GlobalOpenTelemetry.getTracer("ads-service");
    private static final Meter meter = GlobalOpenTelemetry.getMeter("ads-service");
    private static final LongCounter requestCounter = meter.counterBuilder("ads.requests")
        .setDescription("Counts ads service requests.")
        .build();
    private static final LongCounter errorCounter = meter.counterBuilder("ads.errors")
        .setDescription("Counts ads service request failures.")
        .build();
    private static final LongHistogram resultHistogram = meter.histogramBuilder("ads.result_count")
        .ofLongs()
        .setDescription("Records the number of ads returned per request.")
        .setUnit("1")
        .build();

    @Autowired
    private AdvertisementRepository advertisementRepository;

	@RequestMapping("/")
	public String home() {
        recordRequest("/", "GET", "success");
        try (
            MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/");
            MDC.MDCCloseable method = MDC.putCloseable("method", "GET")
        ) {
            logger.info("home url for ads called");
        }
        return "Welcome to Java - Ads Service";
	}

    // OpenTelemetry test endpoint
    @RequestMapping("/otel-test")
    public String otelTest() {
        Span span = tracer.spanBuilder("otel-test-operation")
                          .startSpan();
        try {
            span.addEvent("Starting OpenTelemetry test");
            span.setAttribute("test.service", "ads-java");
            span.setAttribute("test.endpoint", "/otel-test");
            recordRequest("/otel-test", "GET", "success");
            try (
                MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/otel-test");
                MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
                MDC.MDCCloseable eventName = MDC.putCloseable("event_name", "otel_test")
            ) {
                logger.info("OpenTelemetry test endpoint called - Java Ads Service");
            }
            
            span.addEvent("Test completed successfully");
            return "OpenTelemetry is working in Java Ads Service!";
        } finally {
            span.end();
        }
    }

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/banners/{id}",
        produces = MediaType.IMAGE_JPEG_VALUE
    )
    public @ResponseBody byte[] getImageWithMediaType() throws IOException {
        int randomNum = ThreadLocalRandom.current().nextInt(1, 3 + 1);
        String imagePath = "/static/ads/ad" + randomNum + ".jpg";
        recordRequest("/banners/{id}", "GET", "success");
        try (
            MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/banners/{id}");
            MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
            MDC.MDCCloseable banner = MDC.putCloseable("banner_path", imagePath)
        ) {
            logger.info("/banners/{id} called");
        }
        InputStream in = getClass()
            .getResourceAsStream(imagePath);
        return IOUtils.toByteArray(in);
    }

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/ads",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public List<Advertisement> ads(@RequestHeader HashMap<String, String> headers) {
        boolean errorFlag = false;
        if(headers.get("x-throw-error") != null) {
            errorFlag = Boolean.parseBoolean(headers.get("x-throw-error"));
        }

        // if x-error-rate is present, set to variable errorRate (if missing, set to 1)
        double errorRate = 1;
        if(headers.get("x-error-rate") != null) {
            errorRate = Double.parseDouble(headers.get("x-error-rate"));
        }

        if(errorFlag && Math.random() < errorRate) {
            // Intentionally throw error here to demonstrate Logs Error Tracking behavior
            try {
                throw new TimeoutException("took too long to get a response");
            } catch  (Exception e) {
                recordRequest("/ads", "GET", "error");
                recordError("/ads", "GET", e);
                try (
                    MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/ads");
                    MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
                    MDC.MDCCloseable outcome = MDC.putCloseable("outcome", "error");
                    MDC.MDCCloseable requestedErrorRate = MDC.putCloseable("requested_error_rate", String.valueOf(errorRate))
                ) {
                    logger.error("Request failed, check the request headers.", e);
                }
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", e);
            }
        } else {
            List<Advertisement> ads = advertisementRepository.findAll();
            recordRequest("/ads", "GET", "success");
            resultHistogram.record(
                ads.size(),
                io.opentelemetry.api.common.Attributes.of(
                    AttributeKey.stringKey("endpoint"), "/ads",
                    AttributeKey.stringKey("method"), "GET"
                )
            );
            try (
                MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/ads");
                MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
                MDC.MDCCloseable resultCount = MDC.putCloseable("result_count", String.valueOf(ads.size()));
                MDC.MDCCloseable injectedError = MDC.putCloseable("error_injection_enabled", String.valueOf(errorFlag))
            ) {
                logger.info("Total ads available: {}", ads.size());
            }
            return ads;
        }
    }

    private static void recordRequest(String endpoint, String method, String outcome) {
        requestCounter.add(
            1,
            io.opentelemetry.api.common.Attributes.of(
                AttributeKey.stringKey("endpoint"), endpoint,
                AttributeKey.stringKey("method"), method,
                AttributeKey.stringKey("outcome"), outcome
            )
        );
    }

    private static void recordError(String endpoint, String method, Exception err) {
        errorCounter.add(
            1,
            io.opentelemetry.api.common.Attributes.of(
                AttributeKey.stringKey("endpoint"), endpoint,
                AttributeKey.stringKey("method"), method,
                AttributeKey.stringKey("error.type"), err.getClass().getSimpleName()
            )
        );
    }

	public static void main(String[] args) {
		SpringApplication.run(AdsJavaApplication.class, args);
	}

    @Bean
    public CommandLineRunner initDb(AdvertisementRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Advertisement("Discount Clothing", "1.jpg"));
                repository.save(new Advertisement("Cool Hats", "2.jpg"));
                repository.save(new Advertisement("Nice Bags", "3.jpg"));
            }
        };
    }

}
