package com.medibook.core;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class ApiConfig implements WebMvcConfigurer {
  private final Auth auth;

  public ApiConfig(Auth auth) {
    this.auth = auth;
  }

  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(auth).addPathPatterns("/api/**");
  }
}
