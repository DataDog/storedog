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
import com.timgroup.statsd.StatsDClient;
import com.timgroup.statsd.NonBlockingStatsDClient;
import com.timgroup.statsd.NonBlockingStatsDClientBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@RestController
public class AdsJavaApplication {

  private static final Logger logger = LoggerFactory.getLogger(AdsJavaApplication.class);
  private static final StatsDClient StatsD = new NonBlockingStatsDClientBuilder()
      .prefix("statsd")
      .hostname("localhost")
      .port(8124)
      .build();
  private static String[] tags = new String[] { "environment:dev", "service:ads" };

  @RequestMapping("/")
  public String home() {
    logger.info("home url for ads called");
    StatsD.incrementCounter("ads_home.increment", tags);
    return "Welcome to Java - Ads Service";
  }

  @CrossOrigin(origins = { "*" })
  @RequestMapping(value = "/banners/{id}", produces = MediaType.IMAGE_JPEG_VALUE)
  public @ResponseBody byte[] getImageWithMediaType() throws IOException {
    logger.info("/banners/{id} called");
    StatsD.incrementCounter("ads_banners_requested.increment", tags);

    int randomNum = ThreadLocalRandom.current().nextInt(1, 3 + 1);
    String imagePath = "/static/ads/ad" + randomNum + ".jpg";
    StatsD.recordHistogramValue("ads_images_served.histogram", randomNum, tags);
    InputStream in = getClass()
        .getResourceAsStream(imagePath);
    return IOUtils.toByteArray(in);
  }

  @CrossOrigin(origins = { "*" })
  @RequestMapping(value = "/ads", produces = MediaType.APPLICATION_JSON_VALUE)
  public HashMap[] ads(@RequestHeader HashMap<String, String> headers) {
    logger.info("/ads called");
    logger.info("testing changes");
    StatsD.incrementCounter("ads_called.increment", tags);
    boolean errorFlag = false;
    if (headers.get("x-throw-error") != null) {
      errorFlag = Boolean.parseBoolean(headers.get("x-throw-error"));
    }

    // if x-error-rate is present, set to variable errorRate (if missing, set to 1)
    double errorRate = 1;
    if (headers.get("x-error-rate") != null) {
      errorRate = Double.parseDouble(headers.get("x-error-rate"));
    }

    if (errorFlag && Math.random() < errorRate) {
      // Intentionally throw error here to demonstrate Logs Error Tracking behavior
      try {
        throw new TimeoutException("took too long to get a response");
      } catch (Exception e) {
        logger.error("Request failed, check the request headers.");
        throw new RuntimeException(e);
      }
    } else {
      HashMap<String, String> map1 = new HashMap<>();
      map1.put("id", "1");
      map1.put("name", "Discount Clothing");
      map1.put("path", "1.jpg");
      StatsD.recordHistogramValue("ads_served.histogram", 1, tags);

      HashMap<String, String> map2 = new HashMap<>();
      map2.put("id", "2");
      map2.put("name", "Cool Hats");
      map2.put("path", "2.jpg");
      StatsD.recordHistogramValue("ads_served.histogram", 2, tags);

      HashMap<String, String> map3 = new HashMap<>();
      map3.put("id", "3");
      map3.put("name", "Nic Bags");
      map3.put("path", "3.jpg");
      StatsD.recordHistogramValue("ads_served.histogram", 3, tags);

      HashMap[] myArr = { map1, map2, map3 };
      logger.info("Total responses available: " + myArr.length);
      return myArr;
    }
  }

  public static void main(String[] args) {
    SpringApplication.run(AdsJavaApplication.class, args);
    logger.info("Attempting to start the application with statsd");

  }

}
