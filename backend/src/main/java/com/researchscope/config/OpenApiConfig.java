package com.researchscope.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI researchScopeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ResearchScope REST API")
                        .description("Research Intelligence and Research Landscape API supporting OpenAlex, Crossref, and Semantic Scholar data aggregation.")
                        .version("1.0.0"));
    }
}
