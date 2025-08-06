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
    public @ResponseBody byte[] getImageWithMediaType(@PathVariable String id) throws IOException {
        logger.info("/banners/{} called", id);
        
        // Map the image path to the correct static file
        String imagePath;
        switch (id) {
            case "1.jpg":
                imagePath = "/static/ads/ad1.jpg";
                break;
            case "2.jpg":
                imagePath = "/static/ads/ad2.jpg";
                break;
            case "3.jpg":
                imagePath = "/static/ads/ad3.jpg";
                break;
            default:
                // Fallback to random image if unknown
                int randomNum = ThreadLocalRandom.current().nextInt(1, 3 + 1);
                imagePath = "/static/ads/ad" + randomNum + ".jpg";
                logger.warn("Unknown image id: {}, using random image", id);
        }
        
        InputStream in = getClass().getResourceAsStream(imagePath);
        if (in == null) {
            logger.error("Image not found: {}", imagePath);
            throw new IOException("Image not found: " + imagePath);
        }
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
                // Based on actual image content, the files are mislabeled
                // Image 1.jpg shows Discount Clothing content, 2.jpg shows Cool Hats content
                repository.save(new Advertisement("Discount Clothing", "1.jpg", "/discount-clothing"));
                repository.save(new Advertisement("Cool Hats", "2.jpg", "/cool-hats"));
                repository.save(new Advertisement("Nice Bags", "3.jpg", "/nice-bags"));
                logger.info("Initialized database with 3 advertisements with click URLs");
            } else {
                // Always update existing ads to ensure they have the correct click URLs
                List<Advertisement> existingAds = repository.findAll();
                boolean needsUpdate = false;
                
                for (Advertisement ad : existingAds) {
                    String oldClickUrl = ad.getClickUrl();
                    switch (ad.getName()) {
                        case "Discount Clothing":
                            if (!"/discount-clothing".equals(oldClickUrl) || !"1.jpg".equals(ad.getPath())) {
                                ad.setClickUrl("/discount-clothing");
                                ad.setPath("1.jpg");
                                needsUpdate = true;
                                logger.info("Updated '{}' clickUrl from '{}' to '/discount-clothing' and path to '1.jpg'", ad.getName(), oldClickUrl);
                            }
                            break;
                        case "Cool Hats":
                            if (!"/cool-hats".equals(oldClickUrl) || !"2.jpg".equals(ad.getPath())) {
                                ad.setClickUrl("/cool-hats");
                                ad.setPath("2.jpg");
                                needsUpdate = true;
                                logger.info("Updated '{}' clickUrl from '{}' to '/cool-hats' and path to '2.jpg'", ad.getName(), oldClickUrl);
                            }
                            break;
                        case "Nice Bags":
                            if (!"/nice-bags".equals(oldClickUrl) || !"3.jpg".equals(ad.getPath())) {
                                ad.setClickUrl("/nice-bags");
                                ad.setPath("3.jpg");
                                needsUpdate = true;
                                logger.info("Updated '{}' clickUrl from '{}' to '/nice-bags' and path to '3.jpg'", ad.getName(), oldClickUrl);
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
