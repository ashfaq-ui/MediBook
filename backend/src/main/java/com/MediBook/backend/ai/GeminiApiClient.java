package com.MediBook.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class GeminiApiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String chat(String systemPrompt, List<Map<String, String>> messages) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>();

            // Gemini has no system role — prepend as a user/model exchange
            contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", systemPrompt))
            ));
            contents.add(Map.of(
                "role", "model",
                "parts", List.of(Map.of("text", "Understood. I will follow these instructions."))
            ));

            for (Map<String, String> msg : messages) {
                String role = msg.get("role").equals("assistant") ? "model" : "user";
                contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.get("content")))
                ));
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            requestBody.put("generationConfig", Map.of("maxOutputTokens", 1024));

            String url = apiUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(
                objectMapper.writeValueAsString(requestBody), headers
            );

            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );

            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }
}
