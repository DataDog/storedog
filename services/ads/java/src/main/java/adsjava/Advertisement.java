package adsjava;

import javax.persistence.*;

@Entity
public class Advertisement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String path;
    private String url;
    private Double weight;

    public Advertisement() {}

    public Advertisement(String name, String path) {
        this.name = name;
        this.path = path;
    }

    public Advertisement(String name, String path, String url, Double weight) {
        this.name = name;
        this.path = path;
        this.url = url;
        this.weight = weight;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
}
