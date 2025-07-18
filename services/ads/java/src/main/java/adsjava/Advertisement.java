package adsjava;

import javax.persistence.*;

@Entity
public class Advertisement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String path;
    private String clickUrl;

    public Advertisement() {}

    public Advertisement(String name, String path) {
        this.name = name;
        this.path = path;
    }

    public Advertisement(String name, String path, String clickUrl) {
        this.name = name;
        this.path = path;
        this.clickUrl = clickUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getClickUrl() { return clickUrl; }
    public void setClickUrl(String clickUrl) { this.clickUrl = clickUrl; }
} 