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

// OpenTelemetry imports for manual tracing
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.GlobalOpenTelemetry;


@SpringBootApplication
@RestController
public class AdsJavaApplication {

    private static final Logger logger = LoggerFactory.getLogger(AdsJavaApplication.class);
    private static final Tracer tracer = GlobalOpenTelemetry.getTracer("ads-service");

    @Autowired
    private AdvertisementRepository advertisementRepository;

	@RequestMapping("/")
	public String home() {
        logger.info("home url for ads called");
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
            
            logger.info("OpenTelemetry test endpoint called - Java Ads Service");
            
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
        logger.info("/banners/{id} called");
        int randomNum = ThreadLocalRandom.current().nextInt(1, 3 + 1);
        String imagePath = "/static/ads/ad" + randomNum + ".jpg";
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
        logger.info("/ads called");

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
                logger.error("Request failed, check the request headers.");
                throw new RuntimeException(e);
            }
        } else {
            List<Advertisement> ads = advertisementRepository.findAll();
            logger.info("Total ads available: " + ads.size());
            return ads;
        }
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
