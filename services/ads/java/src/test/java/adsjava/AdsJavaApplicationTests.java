package adsjava;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
class AdsJavaApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void serveAdReturnsOneAdvertisement() throws Exception {
		mockMvc.perform(get("/ads/serve").param("placement", "homepage"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id", notNullValue()))
			.andExpect(jsonPath("$.name", notNullValue()))
			.andExpect(jsonPath("$.path", notNullValue()))
			.andExpect(jsonPath("$.url", notNullValue()));
	}

	@Test
	void bannerServesRequestedAdvertisementImage() throws Exception {
		mockMvc.perform(get("/banners/1.jpg").param("placement", "homepage"))
			.andExpect(status().isOk())
			.andExpect(content().contentType("image/jpeg"));
	}

	@Test
	void bannerReturnsNotFoundForUnknownPath() throws Exception {
		mockMvc.perform(get("/banners/not-found.jpg").param("placement", "homepage"))
			.andExpect(status().isNotFound());
	}

	@Test
	void clickRecordsAndRedirectsToAdvertisementUrl() throws Exception {
		mockMvc.perform(get("/ads/1/click").param("placement", "homepage"))
			.andExpect(status().isFound())
			.andExpect(header().string("Location", "/t/clothing"));
	}

}
