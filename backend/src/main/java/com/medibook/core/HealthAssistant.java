package com.medibook.core;

import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** Optional local Ollama adapter. No account details or clinical records are sent. */
@Component
public class HealthAssistant {
  private final ObjectMapper mapper;
  private final String endpoint, model;
  private final HttpClient client =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
  private final Semaphore capacity = new Semaphore(2);
  private final ConcurrentHashMap<Long, Instant> lastRequest = new ConcurrentHashMap<>();

  public HealthAssistant(
      ObjectMapper mapper,
      @Value("${app.ollama-url:http://localhost:11434}") String endpoint,
      @Value("${app.ollama-model:}") String model) {
    this.mapper = mapper;
    this.endpoint = endpoint;
    this.model = model;
  }

  public boolean enabled() {
    return !model.isBlank();
  }

  public Map<String, String> answer(long user, Map<String, Object> body) {
    String question = Db.text(body, "message", 2000, true);
    if (!Boolean.TRUE.equals(body.get("useAi")))
      return Map.of("reply", help(question), "mode", "clinic-help");
    if (!Boolean.TRUE.equals(body.get("consent")))
      throw ApiException.fail(
          400, "Consent is required to send your question to the configured AI service.");
    if (!enabled())
      throw ApiException.fail(503, "AI is not configured. Use clinic help or contact your doctor.");
    Instant now = Instant.now();
    lastRequest.entrySet().removeIf(e -> e.getValue().isBefore(now.minusSeconds(5)));
    if (lastRequest.putIfAbsent(user, now) != null)
      throw ApiException.fail(429, "Please wait a few seconds before asking again.");
    if (!capacity.tryAcquire())
      throw ApiException.fail(429, "The assistant is busy. Please try again shortly.");
    try {
      var payload =
          Map.of(
              "model",
              model,
              "stream",
              false,
              "options",
              Map.of("num_predict", 600),
              "messages",
              List.of(
                  Map.of(
                      "role",
                      "system",
                      "content",
                      "You are MediBook's informational health assistant. Give brief general"
                          + " educational information and help with appointments. Never diagnose,"
                          + " prescribe, suggest drug doses, or claim access to records. Encourage"
                          + " clinician review for personal medical concerns. For urgent or severe"
                          + " symptoms advise immediate local emergency medical help. Do not"
                          + " request personal identifiers. Explicitly state that AI can make"
                          + " mistakes. Booking: choose department, doctor, date, slot. Manage"
                          + " appointments from My appointments. Do not claim to book, cancel, or"
                          + " modify anything."),
                  Map.of("role", "user", "content", question)));
      var request =
          HttpRequest.newBuilder(URI.create(endpoint.replaceAll("/$", "") + "/api/chat"))
              .timeout(Duration.ofSeconds(60))
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload)))
              .build();
      var response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
      try (var stream = response.body()) {
        byte[] bytes = stream.readNBytes(65537);
        if (response.statusCode() != 200 || bytes.length > 65536)
          throw ApiException.fail(
              503, "The AI service is unavailable. Please try clinic help instead.");
        String reply = mapper.readTree(bytes).path("message").path("content").asText("");
        if (reply.isBlank()) throw ApiException.fail(503, "The AI service returned no answer.");
        return Map.of("reply", reply.substring(0, Math.min(reply.length(), 16000)), "mode", "ai");
      }
    } catch (ApiException.Failure e) {
      throw e;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw ApiException.fail(503, "AI request interrupted.");
    } catch (Exception e) {
      throw ApiException.fail(503, "Cannot reach the AI service. Please try clinic help instead.");
    } finally {
      capacity.release();
    }
  }

  private String help(String input) {
    String question = input.toLowerCase(Locale.ROOT);
    return question.contains("cancel")
        ? "Open My appointments and select Cancel on a future active appointment."
        : question.contains("reschedul")
            ? "Open My appointments, choose View details, and select another available time with"
                + " the same doctor."
            : question.contains("book")
                ? "Open Book an appointment, choose a department and doctor, then choose a future"
                    + " available slot and confirm."
                : "I can help with MediBook bookings, cancellations, and rescheduling. For"
                    + " symptoms, medicines, or medical questions, contact a qualified clinician."
                    + " Clinic help does not diagnose or provide treatment.";
  }
}
