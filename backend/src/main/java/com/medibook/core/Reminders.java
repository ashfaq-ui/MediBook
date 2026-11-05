package com.medibook.core;

import java.time.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class Reminders {
  private final Db db;
  private final Mail mail;
  private final ZoneId zone;

  public Reminders(
      Db db, Mail mail, Schema schema, @Value("${app.timezone:Asia/Colombo}") String zone) {
    this.db = db;
    this.mail = mail;
    this.zone = ZoneId.of(zone);
  }

  @Scheduled(fixedDelay = 60000, initialDelay = 60000)
  @Transactional
  public void queue() {
    if (!mail.enabled()) return;
    LocalDateTime now = LocalDateTime.now(zone), until = now.plusHours(24);
    var rows =
        db.list(
            "SELECT a.id,u.email,du.name,s.date,s.start_time FROM appointments a JOIN users u ON"
                + " u.id=a.patient_id JOIN doctors d ON d.id=a.doctor_id JOIN users du ON"
                + " du.id=d.user_id JOIN time_slots s ON s.id=a.slot_id WHERE a.status IN"
                + " ('PENDING','CONFIRMED') AND a.reminder_sent=false AND u.active=true AND"
                + " s.date>=? AND s.date<=?",
            now.toLocalDate(),
            until.toLocalDate());
    for (var row : rows) {
      var start =
          LocalDateTime.of(
              LocalDate.parse(row.get("date").toString()),
              LocalTime.parse(row.get("start_time").toString()));
      if (start.isAfter(now)
          && !start.isAfter(until)
          && db.jdbc.update(
                  "UPDATE appointments SET reminder_sent=true WHERE id=? AND reminder_sent=false",
                  Db.id(row, "id"))
              == 1)
        mail.queue(
            row.get("email").toString(),
            "Upcoming MediBook appointment",
            "Reminder: your appointment with "
                + row.get("name")
                + " is on "
                + row.get("date")
                + " at "
                + row.get("start_time")
                + " ("
                + zone
                + "). Sign in to manage your booking.");
    }
  }
}
