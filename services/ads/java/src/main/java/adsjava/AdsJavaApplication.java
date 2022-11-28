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

@SpringBootApplication
@RestController
public class AdsJavaApplication {

  @CrossOrigin(origins = "http://localhost:3000")
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
		return "Hello from Advertisements (Java)";
	}

  @CrossOrigin(origins = "http://localhost:3000")
  @RequestMapping(
    value = "/ads",
    produces = MediaType.APPLICATION_JSON_VALUE
  )
	public HashMap[] ads() {
    HashMap<String, String> map1 = new HashMap<>();
    map1.put("id", "1");
    map1.put("path", "ad1.jpg");

    HashMap<String, String> map2 = new HashMap<>();
    map2.put("id", "2");
    map2.put("path", "ad2.jpg");

    HashMap<String, String> map3 = new HashMap<>();
    map3.put("id", "3");
    map3.put("path", "ad3.jpg");

    HashMap[] myArr = { map1, map2, map3 };
    return myArr;
	}

	public static void main(String[] args) {
		SpringApplication.run(AdsJavaApplication.class, args);
	}

}
