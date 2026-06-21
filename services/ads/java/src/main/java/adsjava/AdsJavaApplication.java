package adsjava;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.MediaType;
import java.io.*;
import org.springframework.web.bind.annotation.ResponseBody;
import org.apache.commons.io.IOUtils;
import java.util.concurrent.ThreadLocalRandom;
import java.util.HashMap;
import java.util.Map;
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
import org.springframework.web.servlet.view.RedirectView;
import org.slf4j.MDC;

// OpenTelemetry imports for manual tracing
import io.opentelemetry.api.common.Attributes;
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
    private static final LongCounter impressionCounter = meter.counterBuilder("ads.impressions")
        .setDescription("Counts banner impressions by ad and placement.")
        .build();
    private static final LongCounter clickCounter = meter.counterBuilder("ads.clicks")
        .setDescription("Counts ad clicks by ad and placement.")
        .build();
    private static final LongCounter selectionCounter = meter.counterBuilder("ads.selection_count")
        .setDescription("Counts server-side ad selections by ad and placement.")
        .build();
    private static final LongCounter imageErrorCounter = meter.counterBuilder("ads.image_errors")
        .setDescription("Counts banner image failures by path and reason.")
        .build();
    private static final LongCounter noFillCounter = meter.counterBuilder("ads.no_fill")
        .setDescription("Counts requests where no ad was available for a placement.")
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
        value = "/banners/{path:.+}",
        produces = MediaType.IMAGE_JPEG_VALUE
    )
    public @ResponseBody byte[] getImageWithMediaType(
        @PathVariable("path") String path,
        @RequestParam(value = "placement", defaultValue = "homepage") String placement
    ) throws IOException {
        Advertisement ad = advertisementRepository.findByPath(path).orElse(null);
        if (ad == null) {
            recordRequest("/banners/{path}", "GET", "error");
            recordImageError(path, "unknown_ad");
            try (
                MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/banners/{path}");
                MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
                MDC.MDCCloseable bannerPath = MDC.putCloseable("banner_path", path);
                MDC.MDCCloseable reason = MDC.putCloseable("reason", "unknown_ad")
            ) {
                logger.warn("Banner image requested for an unknown ad path");
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Advertisement image not found");
        }

        String imagePath = imageResourcePath(ad);
        try (InputStream in = getClass().getResourceAsStream(imagePath)) {
            if (in == null) {
                recordRequest("/banners/{path}", "GET", "error");
                recordImageError(ad, placement, "missing_resource");
                try (
                    MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/banners/{path}");
                    MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
                    MDC.MDCCloseable adId = MDC.putCloseable("ad_id", String.valueOf(ad.getId()));
                    MDC.MDCCloseable adName = MDC.putCloseable("ad_name", attributeValue(ad.getName()));
                    MDC.MDCCloseable bannerPath = MDC.putCloseable("banner_path", attributeValue(ad.getPath()));
                    MDC.MDCCloseable placementValue = MDC.putCloseable("placement", attributeValue(placement));
                    MDC.MDCCloseable reason = MDC.putCloseable("reason", "missing_resource")
                ) {
                    logger.warn("Banner image resource is missing");
                }
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Advertisement image not found");
            }

            byte[] image = IOUtils.toByteArray(in);
            recordRequest("/banners/{path}", "GET", "success");
            recordAdCounter(impressionCounter, ad, placement);
            try (
                MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/banners/{path}");
                MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
                MDC.MDCCloseable adId = MDC.putCloseable("ad_id", String.valueOf(ad.getId()));
                MDC.MDCCloseable adName = MDC.putCloseable("ad_name", attributeValue(ad.getName()));
                MDC.MDCCloseable bannerPath = MDC.putCloseable("banner_path", attributeValue(ad.getPath()));
                MDC.MDCCloseable placementValue = MDC.putCloseable("placement", attributeValue(placement))
            ) {
                logger.info("Banner impression recorded");
            }
            return image;
        } catch (IOException e) {
            recordRequest("/banners/{path}", "GET", "error");
            recordImageError(ad, placement, "read_failed");
            throw e;
        }
    }

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/ads/{id}/click"
    )
    public RedirectView clickAd(
        @PathVariable("id") Long id,
        @RequestParam(value = "placement", defaultValue = "homepage") String placement
    ) {
        Advertisement ad = advertisementRepository.findById(id).orElse(null);
        if (ad == null) {
            ResponseStatusException err = new ResponseStatusException(HttpStatus.NOT_FOUND, "Advertisement not found");
            recordRequest("/ads/{id}/click", "GET", "error");
            recordError("/ads/{id}/click", "GET", err);
            throw err;
        }

        if (ad.getUrl() == null || ad.getUrl().isBlank()) {
            ResponseStatusException err = new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Advertisement URL is missing");
            recordRequest("/ads/{id}/click", "GET", "error");
            recordError("/ads/{id}/click", "GET", err);
            throw err;
        }

        recordRequest("/ads/{id}/click", "GET", "success");
        recordAdCounter(clickCounter, ad, placement);
        try (
            MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/ads/{id}/click");
            MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
            MDC.MDCCloseable adId = MDC.putCloseable("ad_id", String.valueOf(ad.getId()));
            MDC.MDCCloseable adName = MDC.putCloseable("ad_name", attributeValue(ad.getName()));
            MDC.MDCCloseable placementValue = MDC.putCloseable("placement", attributeValue(placement));
            MDC.MDCCloseable targetUrl = MDC.putCloseable("target_url", attributeValue(ad.getUrl()))
        ) {
            logger.info("Ad click recorded");
        }
        return new RedirectView(ad.getUrl());
    }

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/ads/serve",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Advertisement serveAd(
        @RequestHeader HashMap<String, String> headers,
        @RequestParam(value = "placement", defaultValue = "homepage") String placement
    ) {
        ErrorInjection errorInjection = parseErrorInjection(headers);
        throwInjectedErrorIfRequested("/ads/serve", errorInjection);

        List<Advertisement> ads = advertisementRepository.findAll();
        if (ads.isEmpty()) {
            recordRequest("/ads/serve", "GET", "error");
            recordNoFill(placement);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No advertisements available");
        }

        Advertisement selectedAd = selectAd(ads);
        recordRequest("/ads/serve", "GET", "success");
        recordAdCounter(selectionCounter, selectedAd, placement);
        try (
            MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/ads/serve");
            MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
            MDC.MDCCloseable adId = MDC.putCloseable("ad_id", String.valueOf(selectedAd.getId()));
            MDC.MDCCloseable adName = MDC.putCloseable("ad_name", attributeValue(selectedAd.getName()));
            MDC.MDCCloseable placementValue = MDC.putCloseable("placement", attributeValue(placement));
            MDC.MDCCloseable injectedError = MDC.putCloseable("error_injection_enabled", String.valueOf(errorInjection.enabled))
        ) {
            logger.info("Selected ad for placement");
        }
        return selectedAd;
    }

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/ads",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public List<Advertisement> ads(@RequestHeader HashMap<String, String> headers) {
        ErrorInjection errorInjection = parseErrorInjection(headers);
        throwInjectedErrorIfRequested("/ads", errorInjection);

        List<Advertisement> ads = advertisementRepository.findAll();
        recordRequest("/ads", "GET", "success");
        resultHistogram.record(
            ads.size(),
            Attributes.of(
                AttributeKey.stringKey("endpoint"), "/ads",
                AttributeKey.stringKey("method"), "GET"
            )
        );
        try (
            MDC.MDCCloseable endpoint = MDC.putCloseable("endpoint", "/ads");
            MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
            MDC.MDCCloseable resultCount = MDC.putCloseable("result_count", String.valueOf(ads.size()));
            MDC.MDCCloseable injectedError = MDC.putCloseable("error_injection_enabled", String.valueOf(errorInjection.enabled))
        ) {
            logger.info("Total ads available: {}", ads.size());
        }
        return ads;
    }

    private static void recordRequest(String endpoint, String method, String outcome) {
        requestCounter.add(
            1,
            Attributes.of(
                AttributeKey.stringKey("endpoint"), endpoint,
                AttributeKey.stringKey("method"), method,
                AttributeKey.stringKey("outcome"), outcome
            )
        );
    }

    private static void recordError(String endpoint, String method, Exception err) {
        errorCounter.add(
            1,
            Attributes.of(
                AttributeKey.stringKey("endpoint"), endpoint,
                AttributeKey.stringKey("method"), method,
                AttributeKey.stringKey("error.type"), err.getClass().getSimpleName()
            )
        );
    }

    private static void recordAdCounter(LongCounter counter, Advertisement ad, String placement) {
        counter.add(
            1,
            Attributes.of(
                AttributeKey.stringKey("ad.id"), String.valueOf(ad.getId()),
                AttributeKey.stringKey("ad.name"), attributeValue(ad.getName()),
                AttributeKey.stringKey("ad.path"), attributeValue(ad.getPath()),
                AttributeKey.stringKey("placement"), attributeValue(placement)
            )
        );
    }

    private static void recordImageError(String path, String reason) {
        imageErrorCounter.add(
            1,
            Attributes.of(
                AttributeKey.stringKey("ad.path"), attributeValue(path),
                AttributeKey.stringKey("reason"), attributeValue(reason)
            )
        );
    }

    private static void recordImageError(Advertisement ad, String placement, String reason) {
        imageErrorCounter.add(
            1,
            Attributes.of(
                AttributeKey.stringKey("ad.id"), String.valueOf(ad.getId()),
                AttributeKey.stringKey("ad.name"), attributeValue(ad.getName()),
                AttributeKey.stringKey("ad.path"), attributeValue(ad.getPath()),
                AttributeKey.stringKey("placement"), attributeValue(placement),
                AttributeKey.stringKey("reason"), attributeValue(reason)
            )
        );
    }

    private static void recordNoFill(String placement) {
        noFillCounter.add(
            1,
            Attributes.of(
                AttributeKey.stringKey("placement"), attributeValue(placement)
            )
        );
    }

    private static String attributeValue(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        return value;
    }

    private static Advertisement selectAd(List<Advertisement> ads) {
        double totalWeight = ads.stream()
            .filter(ad -> ad.getWeight() != null && ad.getWeight() > 0)
            .mapToDouble(Advertisement::getWeight)
            .sum();

        if (totalWeight <= 0) {
            return ads.get(ThreadLocalRandom.current().nextInt(ads.size()));
        }

        double target = ThreadLocalRandom.current().nextDouble(totalWeight);
        double runningTotal = 0;
        for (Advertisement ad : ads) {
            if (ad.getWeight() == null || ad.getWeight() <= 0) {
                continue;
            }
            runningTotal += ad.getWeight();
            if (target < runningTotal) {
                return ad;
            }
        }

        return ads.get(ads.size() - 1);
    }

    private static String imageResourcePath(Advertisement ad) {
        String path = ad.getPath();
        String filename = path.startsWith("ad") ? path : "ad" + path;
        return "/static/ads/" + filename;
    }

    private static ErrorInjection parseErrorInjection(HashMap<String, String> headers) {
        boolean enabled = Boolean.parseBoolean(headerValue(headers, "x-throw-error"));
        double rate = 1;
        String errorRate = headerValue(headers, "x-error-rate");
        if (errorRate != null) {
            try {
                rate = Double.parseDouble(errorRate);
            } catch (NumberFormatException e) {
                rate = 1;
            }
        }
        return new ErrorInjection(enabled, rate);
    }

    private static void throwInjectedErrorIfRequested(String endpoint, ErrorInjection errorInjection) {
        if (!errorInjection.enabled || Math.random() >= errorInjection.rate) {
            return;
        }

        TimeoutException e = new TimeoutException("took too long to get a response");
        recordRequest(endpoint, "GET", "error");
        recordError(endpoint, "GET", e);
        try (
            MDC.MDCCloseable endpointValue = MDC.putCloseable("endpoint", endpoint);
            MDC.MDCCloseable method = MDC.putCloseable("method", "GET");
            MDC.MDCCloseable outcome = MDC.putCloseable("outcome", "error");
            MDC.MDCCloseable requestedErrorRate = MDC.putCloseable("requested_error_rate", String.valueOf(errorInjection.rate))
        ) {
            logger.error("Request failed, check the request headers.", e);
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", e);
    }

    private static String headerValue(HashMap<String, String> headers, String name) {
        if (headers == null) {
            return null;
        }

        String value = headers.get(name);
        if (value != null) {
            return value;
        }

        for (Map.Entry<String, String> header : headers.entrySet()) {
            if (header.getKey() != null && header.getKey().equalsIgnoreCase(name)) {
                return header.getValue();
            }
        }

        return null;
    }

    private static class ErrorInjection {
        private final boolean enabled;
        private final double rate;

        private ErrorInjection(boolean enabled, double rate) {
            this.enabled = enabled;
            this.rate = rate;
        }
    }

	public static void main(String[] args) {
		SpringApplication.run(AdsJavaApplication.class, args);
	}

    @Bean
    public CommandLineRunner initDb(AdvertisementRepository repository) {
        return args -> {
            upsertDefaultAdvertisement(repository, "Discount Clothing", "1.jpg", "/t/clothing", 15.1);
            upsertDefaultAdvertisement(repository, "Cool Hats", "2.jpg", "/products/datadog-ringer-t-shirt", 300.1);
            upsertDefaultAdvertisement(repository, "Nice Bags", "3.jpg", "/t/bags", 5242.1);
        };
    }

    private static void upsertDefaultAdvertisement(
        AdvertisementRepository repository,
        String name,
        String path,
        String url,
        Double weight
    ) {
        Advertisement ad = repository.findByPath(path)
            .orElseGet(() -> new Advertisement(name, path));

        boolean changed = ad.getId() == null;
        if (ad.getName() == null || ad.getName().isBlank()) {
            ad.setName(name);
            changed = true;
        }
        if (ad.getUrl() == null || ad.getUrl().isBlank()) {
            ad.setUrl(url);
            changed = true;
        }
        if (ad.getWeight() == null) {
            ad.setWeight(weight);
            changed = true;
        }

        if (changed) {
            repository.save(ad);
        }
    }

}
