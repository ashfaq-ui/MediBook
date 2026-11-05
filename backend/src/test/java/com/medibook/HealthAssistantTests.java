package com.medibook;

import static org.assertj.core.api.Assertions.*;

import com.medibook.core.*;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class HealthAssistantTests {
  @Test
  void clinicHelpWorksWithoutModel() {
    var assistant = new HealthAssistant(JsonMapper.builder().build(), "http://localhost:1", "");
    assertThat(assistant.answer(1, Map.of("message", "How do I book?")))
        .containsEntry("mode", "clinic-help");
    assertThatThrownBy(
            () -> assistant.answer(1, Map.of("message", "Hello", "useAi", true, "consent", true)))
        .isInstanceOf(ApiException.Failure.class)
        .hasMessageContaining("not configured");
  }

  @Test
  void localModelContractAndConsent() throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    var mapper = JsonMapper.builder().build();
    server.createContext(
        "/api/chat",
        exchange -> {
          var body = mapper.readTree(exchange.getRequestBody());
          assertThat(body.path("model").asText()).isEqualTo("test-model");
          assertThat(body.path("stream").asBoolean()).isFalse();
          assertThat(body.path("messages").size()).isEqualTo(2);
          byte[] response =
              "{\"message\":{\"content\":\"General educational information.\"}}"
                  .getBytes(java.nio.charset.StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(200, response.length);
          try (var out = exchange.getResponseBody()) {
            out.write(response);
          }
        });
    server.start();
    try {
      var assistant =
          new HealthAssistant(
              mapper, "http://127.0.0.1:" + server.getAddress().getPort(), "test-model");
      assertThatThrownBy(() -> assistant.answer(1, Map.of("message", "Hello", "useAi", true)))
          .isInstanceOf(ApiException.Failure.class)
          .hasMessageContaining("Consent");
      assertThat(assistant.answer(1, Map.of("message", "Hello", "useAi", true, "consent", true)))
          .containsEntry("reply", "General educational information.");
      assertThatThrownBy(
              () -> assistant.answer(1, Map.of("message", "Hello", "useAi", true, "consent", true)))
          .isInstanceOf(ApiException.Failure.class)
          .hasMessageContaining("wait");
    } finally {
      server.stop(0);
    }
  }
}
