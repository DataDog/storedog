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


@SpringBootApplication
@RestController
public class AdsJavaApplication {

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/banners/{id}",
        produces = MediaType.IMAGE_JPEG_VALUE
    )
    public @ResponseBody byte[] getImageWithMediaType() throws IOException {
        int randomNum = ThreadLocalRandom.current().nextInt(1, 3 + 1);
        String imagePath = "/static/ads/ad" + randomNum + ".jpg";
        InputStream in = getClass()
            .getResourceAsStream(imagePath);
        return IOUtils.toByteArray(in);
    }

	@RequestMapping("/")
	public String home() {
        return "Welcome to Java - Ads Service";
	}

    @CrossOrigin(origins = {"*"})
    @RequestMapping(
        value = "/ads",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
	public HashMap[] ads(@RequestHeader HashMap<String, String> headers) {

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
                System.out.println("took too long to get a response");
                throw new RuntimeException(e);
            }
        } else {
            HashMap<String, String> map1 = new HashMap<>();
            map1.put("id", "1");
            map1.put("name", "Discount Clothing");
            map1.put("path", "1.jpg");

            HashMap<String, String> map2 = new HashMap<>();
            map2.put("id", "2");
            map2.put("name", "Cool Hats");
            map2.put("path", "2.jpg");

            HashMap<String, String> map3 = new HashMap<>();
            map3.put("id", "3");
            map3.put("name", "Nic Bags");
            map3.put("path", "3.jpg");
            System.out.println("ads called");
            HashMap[] myArr = { map1, map2, map3 };
            return myArr;
        }
	}

	public static void main(String[] args) {
		SpringApplication.run(AdsJavaApplication.class, args);
	}

}
