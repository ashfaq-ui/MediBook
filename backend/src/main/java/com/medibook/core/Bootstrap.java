package com.medibook.core;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class Bootstrap implements ApplicationRunner {
  private final Db db;
  private final Auth auth;
  private final String email, password;

  public Bootstrap(
      Db db,
      Auth auth,
      Schema schema,
      @Value("${app.admin-email:}") String email,
      @Value("${app.admin-password:}") String password) {
    this.db = db;
    this.auth = auth;
    this.email = email;
    this.password = password;
  }

  public void run(ApplicationArguments args) {
    if (email.isBlank()
        || password.isBlank()
        || !db.list("SELECT id FROM users WHERE role='ADMIN'").isEmpty()) return;
    var input = Map.<String, Object>of("email", email, "password", password);
    db.insert(
        "INSERT INTO users(email,name,password,role,active) VALUES (?,?,?,'ADMIN',true)",
        Accounts.email(input),
        "Clinic Administrator",
        auth.passwords.encode(Accounts.password(input)));
  }
}
