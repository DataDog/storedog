package adsjava;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import java.io.*;
import org.springframework.web.bind.annotation.ResponseBody;
import org.apache.commons.io.IOUtils;
import java.util.concurrent.ThreadLocalRandom;

@SpringBootApplication
@RestController
public class AdsJavaApplication {

  @RequestMapping(
    value = "/banner",
    produces = MediaType.IMAGE_JPEG_VALUE
  )
  public @ResponseBody byte[] getImageWithMediaType() throws IOException {
    int randomNum = ThreadLocalRandom.current().nextInt(1, 3 + 1);
    String imagePath = "/static/ad" + randomNum + ".jpg";
    InputStream in = getClass()
        .getResourceAsStream(imagePath);
    return IOUtils.toByteArray(in);
  }

	@RequestMapping("/")
	public String home() {
		return "Hello from Advertisements (Java)";
	}

	public static void main(String[] args) {
		SpringApplication.run(AdsJavaApplication.class, args);
	}

}
