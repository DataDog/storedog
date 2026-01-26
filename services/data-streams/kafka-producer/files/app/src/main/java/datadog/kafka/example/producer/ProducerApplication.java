package datadog.kafka.example.producer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.support.converter.JsonMessageConverter;
import org.springframework.kafka.support.converter.RecordMessageConverter;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProducerApplication {
	private static final Logger log = LoggerFactory.getLogger(ProducerApplication.class);

	public static void main(String[] args) {
		String message = String.format("SPRING_ARGS: %s", System.getenv("SPRING_ARGS"));
		System.out.println(message);
		log.info(message);
		SpringApplication.run(ProducerApplication.class, args);
	}

	@Bean
	public RecordMessageConverter converter() {
		return new JsonMessageConverter();
	}
}
