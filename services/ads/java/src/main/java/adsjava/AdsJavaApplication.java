package adsjava;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import java.io.*;
import java.net.URI;
import org.springframework.web.bind.annotation.ResponseBody;
import org.apache.commons.io.IOUtils;
import java.util.concurrent.ThreadLocalRandom;
import java.util.HashMap;
import java.util.Optional;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.concurrent.TimeoutException;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;


@SpringBootApplication
@RestController
public class AdsJavaApplication {

    private static final Logger logger = LoggerFactory.getLogger(AdsJavaApplication.class);

    @Autowired
    private AdvertisementRepository advertisementRepository;

	@RequestMapping("/")
	public String home() {
        logger.info("home url for ads called");
        return "Welcome to Java - Ads Service";
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
    @RequestMapping("/click/{id}")
    public ResponseEntity<Void> handleAdClick(@PathVariable Long id) {
        logger.info("Ad click for id: " + id);
        
        Optional<Advertisement> adOptional = advertisementRepository.findById(id);
        if (adOptional.isPresent()) {
            Advertisement ad = adOptional.get();
            String clickUrl = ad.getClickUrl();
            
            // Log the click for analytics
            logger.info("Redirecting ad '{}' (id: {}) to: {}", ad.getName(), id, clickUrl);
            
            if (clickUrl != null && !clickUrl.isEmpty()) {
                // Return a redirect response to the click URL
                return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(clickUrl))
                    .build();
            } else {
                // Default redirect if no clickUrl is set
                logger.warn("No clickUrl set for ad id: " + id + ", redirecting to homepage");
                return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/"))
                    .build();
            }
        } else {
            logger.error("Ad not found for id: " + id);
            return ResponseEntity.notFound().build();
        }
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
                // Create ads with meaningful click URLs that point to relevant frontend pages
                repository.save(new Advertisement("Discount Clothing", "1.jpg", "/search?q=clothing"));
                repository.save(new Advertisement("Cool Hats", "2.jpg", "/cool-hats"));
                repository.save(new Advertisement("Nice Bags", "3.jpg", "/search?q=bags"));
                logger.info("Initialized database with 3 advertisements with click URLs");
            } else {
                // Always update existing ads to ensure they have the correct click URLs
                List<Advertisement> existingAds = repository.findAll();
                boolean needsUpdate = false;
                
                for (Advertisement ad : existingAds) {
                    String oldClickUrl = ad.getClickUrl();
                    switch (ad.getName()) {
                        case "Discount Clothing":
                            if (!"/search?q=clothing".equals(oldClickUrl)) {
                                ad.setClickUrl("/search?q=clothing");
                                needsUpdate = true;
                                logger.info("Updated '{}' clickUrl from '{}' to '/search?q=clothing'", ad.getName(), oldClickUrl);
                            }
                            break;
                        case "Cool Hats":
                            if (!"/cool-hats".equals(oldClickUrl)) {
                                ad.setClickUrl("/cool-hats");
                                needsUpdate = true;
                                logger.info("Updated '{}' clickUrl from '{}' to '/cool-hats'", ad.getName(), oldClickUrl);
                            }
                            break;
                        case "Nice Bags":
                            if (!"/search?q=bags".equals(oldClickUrl)) {
                                ad.setClickUrl("/search?q=bags");
                                needsUpdate = true;
                                logger.info("Updated '{}' clickUrl from '{}' to '/search?q=bags'", ad.getName(), oldClickUrl);
                            }
                            break;
                        default:
                            logger.info("Unknown ad name: '{}', leaving clickUrl unchanged", ad.getName());
                    }
                }
                
                if (needsUpdate) {
                    repository.saveAll(existingAds);
                    logger.info("Successfully updated existing ads with correct click URLs");
                } else {
                    logger.info("All ads already have correct click URLs, no update needed");
                }
            }
        };
    }

}
