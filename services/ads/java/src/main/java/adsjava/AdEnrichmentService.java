package adsjava;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdEnrichmentService {

    private static final Logger logger = LoggerFactory.getLogger(AdEnrichmentService.class);

    private final RestTemplate restTemplate;
    private final String adProviderUrl;

    public AdEnrichmentService(
            @Value("${ad.provider.url:http://ad-provider:8081}") String adProviderUrl) {
        this.restTemplate = new RestTemplate();
        this.adProviderUrl = adProviderUrl;
    }

    /**
     * Enrich a single ad by calling the ad-provider service.
     * This method makes one HTTP call per ad - use enrichBatch for better performance.
     */
    public Map<String, Object> enrichSingle(Long adId) {
        String url = adProviderUrl + "/enrich?ad_id=" + adId;
        logger.info("Enriching single ad: {}", adId);
        return restTemplate.getForObject(url, Map.class);
    }

    /**
     * Enrich multiple ads in a single batch call to the ad-provider service.
     * This is the preferred method - one HTTP call for all ads.
     */
    public Map<String, Object> enrichBatch(List<Long> adIds) {
        String idsParam = adIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        String url = adProviderUrl + "/enrich/batch?ad_ids=" + idsParam;
        logger.info("Enriching batch of {} ads", adIds.size());
        return restTemplate.getForObject(url, Map.class);
    }
}
