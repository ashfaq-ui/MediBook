package com.medibook.core;

import jakarta.servlet.http.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class Auth implements HandlerInterceptor {
  final Db db;
  final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(12);
  private final Set<String> origins;
  private final boolean secure;

  public Auth(
      Db db,
      @Value("${app.cors.allowed-origins}") String origins,
      @Value("${app.cookie-secure:false}") boolean secure) {
    this.db = db;
    this.origins = new HashSet<>(Arrays.asList(origins.split(",")));
    this.secure = secure;
  }

  public static String token() {
    byte[] bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  public static String hash(String token) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  public String sessionToken(HttpServletRequest request) {
    if (request.getCookies() != null)
      for (var c : request.getCookies())
        if (c.getName().equals("medibook_session")) return c.getValue();
    return "";
  }

  public Map<String, Object> user(HttpServletRequest request) {
    var rows =
        db.list(
            "SELECT u.id,u.email,u.name,u.role,u.active FROM users u JOIN auth_sessions s ON"
                + " u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=true",
            hash(sessionToken(request)),
            java.sql.Timestamp.from(Instant.now()));
    if (rows.isEmpty()) throw ApiException.fail(401, "Please sign in.");
    return rows.get(0);
  }

  public void cookie(HttpServletResponse response, String value, int seconds) {
    response.addHeader(
        "Set-Cookie",
        "medibook_session="
            + value
            + "; Path=/api; HttpOnly; SameSite=Lax; Max-Age="
            + seconds
            + (secure ? "; Secure" : ""));
  }

  public void signIn(long id, boolean remember, HttpServletResponse response) {
    String token = token();
    int seconds = remember ? 2592000 : 86400;
    db.jdbc.update(
        "DELETE FROM auth_sessions WHERE expires_at<?", java.sql.Timestamp.from(Instant.now()));
    db.jdbc.update(
        "INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES (?,?,?)",
        hash(token),
        id,
        java.sql.Timestamp.from(Instant.now().plusSeconds(seconds)));
    cookie(response, token, seconds);
  }

  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    response.setHeader("Cache-Control", "no-store");
    if (request.getMethod().equals("OPTIONS")) return true;
    if (!Set.of("GET", "HEAD").contains(request.getMethod())) {
      String origin = request.getHeader("Origin");
      if (!"MediBook".equals(request.getHeader("X-Requested-With"))
          || (origin != null && !origins.contains(origin)))
        throw ApiException.fail(403, "Request origin is not permitted.");
    }
    String path = request.getRequestURI();
    if (path.equals("/api/health")
        || Set.of(
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/forgot-password",
                "/api/auth/reset-password")
            .contains(path)) return true;
    var user = user(request);
    request.setAttribute("user", user);
    String role = user.get("role").toString();
    if (path.startsWith("/api/admin/") && !role.equals("ADMIN")
        || path.startsWith("/api/doctor/") && !role.equals("DOCTOR")
        || path.startsWith("/api/patient/") && !role.equals("PATIENT"))
      throw ApiException.fail(403, "You do not have access to this feature.");
    return true;
  }
}
