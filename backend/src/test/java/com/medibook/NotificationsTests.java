package com.medibook;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.medibook.core.*;
import java.time.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@TestPropertySource(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:mail;DB_CLOSE_DELAY=-1",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "app.mail-enabled=true",
      "spring.mail.host=localhost",
      "app.admin-email=",
      "app.admin-password="
    })
class NotificationsTests {
  @Autowired Db db;
  @Autowired Mail mail;
  @Autowired Reminders reminders;
  @MockitoBean JavaMailSender sender;

  @BeforeEach
  void clear() {
    for (String table :
        java.util.List.of(
            "email_outbox", "appointments", "time_slots", "doctors", "departments", "users"))
      db.jdbc.update("DELETE FROM " + table);
  }

  @Test
  void deliveryAndRetry() {
    mail.queue("patient@example.test", "Confirmation", "Appointment details");
    doThrow(new MailSendException("temporary failure"))
        .when(sender)
        .send(any(SimpleMailMessage.class));
    mail.deliver();
    var failed = db.one("SELECT * FROM email_outbox");
    assertThat(failed.get("attempts")).isEqualTo(1);
    assertThat(failed.get("sent_at")).isNull();
    reset(sender);
    mail.deliver();
    verify(sender).send(any(SimpleMailMessage.class));
    var delivered = db.one("SELECT * FROM email_outbox");
    assertThat(delivered.get("sent_at")).isNotNull();
    assertThat(delivered.get("recipient")).isEqualTo("redacted");
    mail.deliver();
    verifyNoMoreInteractions(sender);
  }

  @Test
  void upcomingRemindersAreQueuedOnce() {
    long patient =
        db.insert(
            "INSERT INTO users(name,email,password,role) VALUES"
                + " ('Patient','patient@example.test','hash','PATIENT')");
    long user =
        db.insert(
            "INSERT INTO users(name,email,password,role) VALUES"
                + " ('Doctor','doctor@example.test','hash','DOCTOR')");
    long dept = db.insert("INSERT INTO departments(name) VALUES ('Clinic')");
    long doctor = db.insert("INSERT INTO doctors(user_id,department_id) VALUES (?,?)", user, dept);
    var start = LocalDateTime.now(ZoneId.of("Asia/Colombo")).plusHours(2);
    long slot =
        db.insert(
            "INSERT INTO time_slots(doctor_id,date,start_time,end_time,booked) VALUES"
                + " (?,?,?,?,true)",
            doctor,
            start.toLocalDate(),
            start.toLocalTime(),
            start.plusMinutes(30).toLocalTime());
    db.insert(
        "INSERT INTO appointments(patient_id,doctor_id,slot_id,status) VALUES (?,?,?,'CONFIRMED')",
        patient,
        doctor,
        slot);
    reminders.queue();
    reminders.queue();
    assertThat(db.jdbc.queryForObject("SELECT COUNT(*) FROM email_outbox", Integer.class))
        .isEqualTo(1);
  }
}
