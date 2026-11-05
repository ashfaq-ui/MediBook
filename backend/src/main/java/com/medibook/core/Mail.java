package com.medibook.core;

import java.time.Instant;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Component;

@Component
public class Mail {
  private final Db db;
  private final ObjectProvider<JavaMailSender> senders;
  private final boolean enabled;
  private final String from;
  private final String host;

  public Mail(
      Db db,
      ObjectProvider<JavaMailSender> senders,
      @Value("${app.mail-enabled:false}") boolean enabled,
      @Value("${app.mail-from:noreply@localhost}") String from,
      @Value("${spring.mail.host:}") String host) {
    this.db = db;
    this.senders = senders;
    this.enabled = enabled;
    this.from = from;
    this.host = host;
  }

  public boolean enabled() {
    return enabled && !host.isBlank() && senders.getIfAvailable() != null;
  }

  public void queue(String recipient, String subject, String body) {
    if (enabled())
      db.insert(
          "INSERT INTO email_outbox(recipient,subject,body) VALUES (?,?,?)",
          recipient,
          subject,
          body);
  }

  @Scheduled(fixedDelay = 30000, initialDelay = 30000)
  @org.springframework.transaction.annotation.Transactional
  public void deliver() {
    if (!enabled()) return;
    for (var row :
        db.list(
            "SELECT * FROM email_outbox WHERE sent_at IS NULL AND attempts<5 ORDER BY id LIMIT 20"
                + " FOR UPDATE SKIP LOCKED")) {
      long id = Db.id(row, "id");
      db.jdbc.update("UPDATE email_outbox SET attempts=attempts+1 WHERE id=?", id);
      try {
        var message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(row.get("recipient").toString());
        message.setSubject(row.get("subject").toString());
        message.setText(row.get("body").toString());
        senders.getObject().send(message);
        db.jdbc.update(
            "UPDATE email_outbox SET sent_at=?,body='Delivered',recipient='redacted' WHERE id=?",
            java.sql.Timestamp.from(Instant.now()),
            id);
      } catch (org.springframework.mail.MailException e) {
        /* Retry without logging personal data. */
      }
    }
    db.jdbc.update(
        "DELETE FROM password_resets WHERE expires_at<?", java.sql.Timestamp.from(Instant.now()));
    db.jdbc.update(
        "DELETE FROM email_outbox WHERE created_at<?",
        java.sql.Timestamp.from(Instant.now().minusSeconds(604800)));
  }
}

@Configuration
@EnableScheduling
class Scheduling {}
