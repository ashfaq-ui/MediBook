package com.medibook.core;

import jakarta.servlet.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class Accounts {
  private final Db db;
  private final Auth auth;
  private final Mail mail;
  private final String frontend;
  private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

  record Attempt(long minute, int count) {}

  public Accounts(
      Db db,
      Auth auth,
      Mail mail,
      @Value("${app.frontend-url:http://localhost:3000}") String frontend) {
    this.db = db;
    this.auth = auth;
    this.mail = mail;
    this.frontend = frontend;
  }

  private void limit(HttpServletRequest r) {
    long minute = System.currentTimeMillis() / 60000;
    if (attempts.size() > 10000) attempts.entrySet().removeIf(e -> e.getValue().minute() < minute);
    var a =
        attempts.compute(
            r.getRemoteAddr(),
            (k, v) ->
                v == null || v.minute() != minute
                    ? new Attempt(minute, 1)
                    : new Attempt(minute, v.count() + 1));
    if (a.count() > 15) throw ApiException.fail(429, "Too many attempts. Try again in a minute.");
  }

  static String email(Map<String, Object> b) {
    String e = Db.text(b, "email", 255, true).toLowerCase(Locale.ROOT);
    if (!e.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
      throw ApiException.fail(400, "Enter a valid email address.");
    return e;
  }

  static String password(Map<String, Object> b) {
    Object p = b.get("password");
    String s = p == null ? "" : p.toString();
    if (s.length() < 10 || s.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw ApiException.fail(
          400, "Password must contain at least 10 characters and at most 72 bytes.");
    return s;
  }

  @PostMapping("/register")
  @Transactional
  public Map<String, Object> register(
      @RequestBody Map<String, Object> b, HttpServletRequest req, HttpServletResponse res) {
    limit(req);
    String email = email(b), password = password(b), name = Db.text(b, "name", 255, true);
    if (!Objects.equals(password, b.get("confirmPassword")))
      throw ApiException.fail(400, "Passwords do not match.");
    if (!db.list("SELECT id FROM users WHERE LOWER(email)=?", email).isEmpty())
      throw ApiException.fail(409, "An account with that email already exists.");
    long id =
        db.insert(
            "INSERT INTO users(email,name,password,role,active) VALUES (?,?,?,'PATIENT',true)",
            email,
            name,
            auth.passwords.encode(password));
    auth.signIn(id, false, res);
    return db.one("SELECT id,email,name,role,active FROM users WHERE id=?", id);
  }

  @PostMapping("/login")
  public Map<String, Object> login(
      @RequestBody Map<String, Object> b, HttpServletRequest req, HttpServletResponse res) {
    limit(req);
    var rows = db.list("SELECT * FROM users WHERE LOWER(email)=?", email(b));
    String supplied = Objects.toString(b.get("password"), "");
    String encoded =
        rows.isEmpty()
            ? "$2a$12$wvBnLjNQ60kVOdBSBp7lbOGrd1bNCw2dU7gPUE7.ZHVVfAm9NJdGy"
            : rows.get(0).get("password").toString();
    if (supplied.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72
        || !auth.passwords.matches(supplied, encoded)
        || rows.isEmpty()
        || !Boolean.TRUE.equals(rows.get(0).get("active")))
      throw ApiException.fail(401, "Email or password is incorrect, or the account is inactive.");
    long id = Db.id(rows.get(0), "id");
    auth.signIn(id, Boolean.TRUE.equals(b.get("remember")), res);
    return db.one("SELECT id,email,name,role,active FROM users WHERE id=?", id);
  }

  @GetMapping("/me")
  public Map<String, Object> me(HttpServletRequest r) {
    return auth.user(r);
  }

  @PostMapping("/logout")
  public Map<String, String> logout(HttpServletRequest r, HttpServletResponse res) {
    db.jdbc.update("DELETE FROM auth_sessions WHERE token_hash=?", Auth.hash(auth.sessionToken(r)));
    auth.cookie(res, "", 0);
    return Map.of("message", "Signed out.");
  }

  @PostMapping("/change-password")
  @Transactional
  public Map<String, String> changePassword(
      @RequestBody Map<String, Object> b, HttpServletRequest r, HttpServletResponse res) {
    limit(r);
    long id = Db.id(auth.user(r), "id");
    var account = db.one("SELECT password FROM users WHERE id=? FOR UPDATE", id);
    String current = Objects.toString(b.get("currentPassword"), "");
    if (current.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72
        || !auth.passwords.matches(current, account.get("password").toString()))
      throw ApiException.fail(400, "Current password is incorrect.");
    String next = password(b);
    if (!Objects.equals(next, b.get("confirmPassword")))
      throw ApiException.fail(400, "Passwords do not match.");
    db.jdbc.update("UPDATE users SET password=? WHERE id=?", auth.passwords.encode(next), id);
    db.jdbc.update("DELETE FROM auth_sessions WHERE user_id=?", id);
    db.jdbc.update("DELETE FROM password_resets WHERE user_id=?", id);
    auth.signIn(id, false, res);
    return Map.of("message", "Password changed. Other sessions have been signed out.");
  }

  @PostMapping("/forgot-password")
  @Transactional
  public Map<String, String> forgot(@RequestBody Map<String, Object> b, HttpServletRequest r) {
    limit(r);
    if (!mail.enabled())
      throw ApiException.fail(
          503, "Password reset email is not configured. Contact the clinic administrator.");
    var rows = db.list("SELECT id FROM users WHERE LOWER(email)=? AND active=true", email(b));
    if (!rows.isEmpty()) {
      long id = Db.id(rows.get(0), "id");
      String token = Auth.token();
      db.jdbc.update("DELETE FROM password_resets WHERE user_id=?", id);
      db.jdbc.update(
          "INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES (?,?,?)",
          Auth.hash(token),
          id,
          java.sql.Timestamp.from(Instant.now().plusSeconds(1800)));
      mail.queue(
          email(b),
          "Reset your MediBook password",
          "Reset your password within 30 minutes: "
              + frontend
              + "/reset-password#"
              + token
              + "\nIgnore this email if you did not request a reset.");
    }
    return Map.of("message", "If an active account exists, a password reset email will be sent.");
  }

  @PostMapping("/reset-password")
  @Transactional
  public Map<String, String> reset(@RequestBody Map<String, Object> b, HttpServletRequest r) {
    limit(r);
    String password = password(b);
    if (!Objects.equals(password, b.get("confirmPassword")))
      throw ApiException.fail(400, "Passwords do not match.");
    var rows =
        db.list(
            "SELECT * FROM password_resets WHERE token_hash=? AND expires_at>? FOR UPDATE",
            Auth.hash(Db.text(b, "token", 100, true)),
            java.sql.Timestamp.from(Instant.now()));
    if (rows.isEmpty()) throw ApiException.fail(400, "Reset link is invalid or expired.");
    long id = Db.id(rows.get(0), "user_id");
    db.jdbc.update("UPDATE users SET password=? WHERE id=?", auth.passwords.encode(password), id);
    db.jdbc.update("DELETE FROM password_resets WHERE user_id=?", id);
    db.jdbc.update("DELETE FROM auth_sessions WHERE user_id=?", id);
    return Map.of("message", "Password updated. You can now sign in.");
  }
}
