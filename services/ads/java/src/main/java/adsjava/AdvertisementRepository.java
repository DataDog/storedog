package adsjava;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {
    Optional<Advertisement> findByPath(String path);
}
