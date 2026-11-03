package com.researchscope;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ResearchscopeApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResearchscopeApplication.class, args);
	}

}
