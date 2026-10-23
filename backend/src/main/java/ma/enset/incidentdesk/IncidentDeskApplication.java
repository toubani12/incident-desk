package ma.enset.incidentdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class IncidentDeskApplication {

    public static void main(String[] args) {
        SpringApplication.run(IncidentDeskApplication.class, args);
    }
}
