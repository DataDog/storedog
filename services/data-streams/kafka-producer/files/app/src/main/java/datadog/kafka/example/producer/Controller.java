package datadog.kafka.example.producer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {
	private final Logger log = LoggerFactory.getLogger(Controller.class);

	@Autowired
	private KafkaTemplate<Object, Object> template;

	@PostMapping(path = "/send/{topic}/{what}")
	public void sendFoo(@PathVariable String topic, @PathVariable String what) {
		log.info("Sending {} on {}", what, topic);
		this.template.send(topic, what);
	}
}
