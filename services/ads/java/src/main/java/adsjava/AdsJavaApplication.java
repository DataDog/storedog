package adsjava;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class AdsJavaApplication {

	@RequestMapping("/")
	public String home() {
		return "Hello Docker World";
	}

	@RequestMapping("/banner")
	public String banner() {
		return "Hello Docker World 2";
	}

	public static void main(String[] args) {
		SpringApplication.run(AdsJavaApplication.class, args);
	}

}
