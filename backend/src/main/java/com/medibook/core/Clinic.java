package com.medibook.core;

import jakarta.servlet.http.HttpServletRequest;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class Clinic {
  final Db db;
  final Auth auth;
  final Mail mail;
  final ZoneId zone;
  final HealthAssistant assistant;
  static final String APPOINTMENTS =
      "SELECT a.*,s.date,s.start_time,s.end_time,u.name AS patient_name,u.email AS"
          + " patient_email,du.name AS doctor_name,dp.name AS department_name FROM appointments a"
          + " JOIN time_slots s ON s.id=a.slot_id JOIN users u ON u.id=a.patient_id JOIN doctors d"
          + " ON d.id=a.doctor_id JOIN users du ON du.id=d.user_id JOIN departments dp ON"
          + " dp.id=d.department_id ";

  public Clinic(
      Db db,
      Auth auth,
      Mail mail,
      HealthAssistant assistant,
      @Value("${app.timezone:Asia/Colombo}") String zone) {
    this.db = db;
    this.auth = auth;
    this.mail = mail;
    this.assistant = assistant;
    this.zone = ZoneId.of(zone);
  }

  Map<String, Object> user(HttpServletRequest r) {
    return auth.user(r);
  }

  long uid(HttpServletRequest r) {
    return Db.id(user(r), "id");
  }

  long doctor(HttpServletRequest r) {
    return Db.id(db.one("SELECT id FROM doctors WHERE user_id=?", uid(r)), "id");
  }

  LocalDateTime now() {
    return LocalDateTime.now(zone);
  }

  boolean future(Map<String, Object> s) {
    return LocalDateTime.of(
            LocalDate.parse(s.get("date").toString()),
            LocalTime.parse(s.get("start_time").toString()))
        .isAfter(now());
  }

  void require(boolean condition, String message) {
    if (!condition) throw ApiException.fail(409, message);
  }

  boolean activeStatus(Object value) {
    return Set.of("PENDING", "CONFIRMED").contains(value);
  }

  @GetMapping("/departments")
  public Object departments() {
    return db.list("SELECT * FROM departments ORDER BY name");
  }

  @GetMapping("/doctors")
  public Object doctors(@RequestParam(required = false) Long departmentId) {
    String sql =
        "SELECT d.*,u.name,u.email,u.active,dp.name AS department_name FROM doctors d JOIN users u"
            + " ON u.id=d.user_id JOIN departments dp ON dp.id=d.department_id WHERE u.active=true";
    return departmentId == null
        ? db.list(sql + " ORDER BY u.name")
        : db.list(sql + " AND d.department_id=? ORDER BY u.name", departmentId);
  }

  @GetMapping("/slots")
  public Object slots(@RequestParam long doctorId, @RequestParam(required = false) LocalDate date) {
    var slots =
        date == null
            ? db.list(
                "SELECT s.* FROM time_slots s JOIN doctors d ON d.id=s.doctor_id JOIN users u ON"
                    + " u.id=d.user_id WHERE s.doctor_id=? AND u.active=true AND s.booked=false AND"
                    + " NOT EXISTS (SELECT 1 FROM appointments a WHERE a.slot_id=s.id AND"
                    + " a.status<>'CANCELLED') ORDER BY s.date,s.start_time",
                doctorId)
            : db.list(
                "SELECT s.* FROM time_slots s JOIN doctors d ON d.id=s.doctor_id JOIN users u ON"
                    + " u.id=d.user_id WHERE s.doctor_id=? AND s.date=? AND u.active=true AND"
                    + " s.booked=false AND NOT EXISTS (SELECT 1 FROM appointments a WHERE"
                    + " a.slot_id=s.id AND a.status<>'CANCELLED') ORDER BY s.start_time",
                doctorId,
                date);
    return slots.stream().filter(this::future).toList();
  }

  @GetMapping("/{role:patient|doctor|admin}/appointments")
  public Object appointments(@PathVariable String role, HttpServletRequest r) {
    var rows =
        switch (role) {
          case "patient" ->
              db.list(
                  APPOINTMENTS + "WHERE a.patient_id=? ORDER BY s.date DESC,s.start_time DESC",
                  uid(r));
          case "doctor" ->
              db.list(
                  APPOINTMENTS + "WHERE a.doctor_id=? ORDER BY s.date DESC,s.start_time DESC",
                  doctor(r));
          default -> db.list(APPOINTMENTS + "ORDER BY s.date DESC,s.start_time DESC");
        };
    for (var row : rows) {
      row.remove("patient_email");
      if (role.equals("patient") && !Boolean.TRUE.equals(row.get("shared"))) {
        row.remove("ai_summary");
        row.remove("diagnosis");
        row.remove("prescription");
        row.remove("follow_up");
      }
    }
    return rows;
  }

  void available(Map<String, Object> s, long patient, long exclude) {
    require(future(s), "Choose a future appointment time.");
    require(
        !Boolean.TRUE.equals(s.get("booked"))
            && db.list(
                    "SELECT id FROM appointments WHERE slot_id=? AND status<>'CANCELLED'",
                    Db.id(s, "id"))
                .isEmpty(),
        "This slot is already booked.");
    require(
        !db.list(
                "SELECT u.id FROM doctors d JOIN users u ON u.id=d.user_id WHERE d.id=? AND"
                    + " u.active=true",
                Db.id(s, "doctor_id"))
            .isEmpty(),
        "This doctor is unavailable.");
    require(
        db.list(
                "SELECT a.id FROM appointments a JOIN time_slots s ON s.id=a.slot_id WHERE"
                    + " a.patient_id=? AND a.id<>? AND a.status IN ('PENDING','CONFIRMED') AND"
                    + " s.date=? AND s.start_time<? AND s.end_time>?",
                patient,
                exclude,
                LocalDate.parse(s.get("date").toString()),
                LocalTime.parse(s.get("end_time").toString()),
                LocalTime.parse(s.get("start_time").toString()))
            .isEmpty(),
        "You already have an appointment during this time.");
  }

  @PostMapping("/patient/appointments")
  @Transactional
  public Object book(@RequestBody Map<String, Object> b, HttpServletRequest r) {
    long patient = uid(r);
    db.one("SELECT id FROM users WHERE id=? FOR UPDATE", patient);
    var slot = db.one("SELECT * FROM time_slots WHERE id=? FOR UPDATE", Db.number(b, "slotId"));
    available(slot, patient, 0);
    long id =
        db.insert(
            "INSERT INTO appointments(patient_id,doctor_id,slot_id,status,notes,created_at) VALUES"
                + " (?,?,?,'CONFIRMED',?,?)",
            patient,
            Db.id(slot, "doctor_id"),
            Db.id(slot, "id"),
            Db.text(b, "notes", 255, false),
            java.sql.Timestamp.valueOf(now()));
    db.jdbc.update("UPDATE time_slots SET booked=true WHERE id=?", Db.id(slot, "id"));
    notifyAppointment(id, "Appointment confirmed");
    return Map.of("id", id, "message", "Appointment booked.");
  }

  Map<String, Object> authorizedAppointment(long id, HttpServletRequest r) {
    var a = db.one("SELECT * FROM appointments WHERE id=? FOR UPDATE", id);
    var u = user(r);
    switch (u.get("role").toString()) {
      case "PATIENT" -> {
        if (Db.id(a, "patient_id") != Db.id(u, "id"))
          throw ApiException.fail(404, "Appointment not found.");
      }
      case "DOCTOR" -> {
        if (Db.id(a, "doctor_id") != doctor(r))
          throw ApiException.fail(404, "Appointment not found.");
      }
    }
    return a;
  }

  @PostMapping("/{role:patient|doctor|admin}/appointments/{id}/cancel")
  @Transactional
  public Object cancel(@PathVariable long id, HttpServletRequest r) {
    var a = authorizedAppointment(id, r);
    require(activeStatus(a.get("status")), "Only active appointments can be cancelled.");
    var s = db.one("SELECT * FROM time_slots WHERE id=? FOR UPDATE", Db.id(a, "slot_id"));
    require(future(s), "Past appointments cannot be cancelled.");
    db.jdbc.update("UPDATE appointments SET status='CANCELLED' WHERE id=?", id);
    db.jdbc.update("UPDATE time_slots SET booked=false WHERE id=?", Db.id(a, "slot_id"));
    notifyAppointment(id, "Appointment cancelled");
    return Map.of("message", "Appointment cancelled.");
  }

  @PostMapping("/patient/appointments/{id}/reschedule")
  @Transactional
  public Object reschedule(
      @PathVariable long id, @RequestBody Map<String, Object> b, HttpServletRequest r) {
    long patient = uid(r);
    db.one("SELECT id FROM users WHERE id=? FOR UPDATE", patient);
    var a = authorizedAppointment(id, r);
    require(activeStatus(a.get("status")), "Only active appointments can be rescheduled.");
    long target = Db.number(b, "slotId"), old = Db.id(a, "slot_id");
    require(target != old, "Choose a different slot.");
    db.list("SELECT id FROM time_slots WHERE id IN (?,?) ORDER BY id FOR UPDATE", old, target);
    require(
        future(db.one("SELECT * FROM time_slots WHERE id=?", old)),
        "Past appointments cannot be rescheduled.");
    var s = db.one("SELECT * FROM time_slots WHERE id=?", target);
    require(
        Db.id(s, "doctor_id") == Db.id(a, "doctor_id"), "Rescheduling must use the same doctor.");
    available(s, patient, id);
    db.jdbc.update("UPDATE appointments SET slot_id=?,reminder_sent=false WHERE id=?", target, id);
    db.jdbc.update("UPDATE time_slots SET booked=false WHERE id=?", old);
    db.jdbc.update("UPDATE time_slots SET booked=true WHERE id=?", target);
    notifyAppointment(id, "Appointment rescheduled");
    return Map.of("message", "Appointment rescheduled.");
  }

  @PostMapping("/doctor/appointments/{id}/complete")
  @Transactional
  public Object complete(
      @PathVariable long id, @RequestBody Map<String, Object> b, HttpServletRequest r) {
    var a = authorizedAppointment(id, r);
    require(activeStatus(a.get("status")), "Only active appointments can be completed.");
    var slot = db.one("SELECT * FROM time_slots WHERE id=?", Db.id(a, "slot_id"));
    require(!future(slot), "The appointment has not started yet.");
    saveSummary(id, b);
    db.jdbc.update("UPDATE appointments SET status='COMPLETED' WHERE id=?", id);
    notifyAppointment(id, "Appointment completed");
    return Map.of("message", "Consultation completed.");
  }

  @PostMapping("/doctor/appointments/{id}/no-show")
  @Transactional
  public Object noShow(@PathVariable long id, HttpServletRequest r) {
    var a = authorizedAppointment(id, r);
    require(activeStatus(a.get("status")), "Only active appointments can be marked as missed.");
    var slot = db.one("SELECT * FROM time_slots WHERE id=?", Db.id(a, "slot_id"));
    require(
        LocalDateTime.of(
                LocalDate.parse(slot.get("date").toString()),
                LocalTime.parse(slot.get("end_time").toString()))
            .isBefore(now()),
        "Wait until the appointment has ended.");
    db.jdbc.update("UPDATE appointments SET status='NO_SHOW' WHERE id=?", id);
    return Map.of("message", "Appointment marked as no-show.");
  }

  @PutMapping("/doctor/appointments/{id}/summary")
  @Transactional
  public Object summary(
      @PathVariable long id, @RequestBody Map<String, Object> b, HttpServletRequest r) {
    var a = authorizedAppointment(id, r);
    require(
        !Set.of("CANCELLED", "NO_SHOW").contains(a.get("status")),
        "Cancelled or missed appointments cannot be edited.");
    saveSummary(id, b);
    return Map.of("message", "Summary saved.");
  }

  void saveSummary(long id, Map<String, Object> b) {
    String date = Db.text(b, "followUp", 10, false);
    LocalDate follow = date.isEmpty() ? null : LocalDate.parse(date);
    if (follow != null && follow.isBefore(now().toLocalDate()))
      throw ApiException.fail(400, "Follow-up date must be today or later.");
    db.jdbc.update(
        "UPDATE appointments SET diagnosis=?,prescription=?,follow_up=?,shared=? WHERE id=?",
        Db.text(b, "diagnosis", 10000, true),
        Db.text(b, "prescription", 10000, false),
        follow,
        Boolean.TRUE.equals(b.get("shared")),
        id);
  }

  void notifyAppointment(long id, String subject) {
    var a = db.one(APPOINTMENTS + "WHERE a.id=?", id);
    mail.queue(
        a.get("patient_email").toString(),
        subject,
        "Your MediBook appointment with "
            + a.get("doctor_name")
            + " on "
            + a.get("date")
            + " at "
            + a.get("start_time")
            + " is "
            + a.get("status")
            + ". Sign in to view details.");
  }

  @GetMapping("/doctor/slots")
  public Object ownSlots(HttpServletRequest r) {
    return db.list(
        "SELECT * FROM time_slots WHERE doctor_id=? ORDER BY date DESC,start_time", doctor(r));
  }

  @PostMapping("/doctor/slots")
  @Transactional
  public Object addSlots(@RequestBody Map<String, Object> b, HttpServletRequest r) {
    long doctor = doctor(r);
    db.one("SELECT id FROM doctors WHERE id=? FOR UPDATE", doctor);
    LocalDate date = LocalDate.parse(Db.text(b, "date", 10, true));
    LocalTime start = LocalTime.parse(Db.text(b, "startTime", 8, true)),
        end = LocalTime.parse(Db.text(b, "endTime", 8, true));
    int duration = Integer.parseInt(Objects.toString(b.get("duration"), "30"));
    require(
        duration >= 5
            && duration <= 240
            && start.isBefore(end)
            && LocalDateTime.of(date, start).isAfter(now()),
        "Choose a future date, valid time range, and duration from 5 to 240 minutes.");
    require(start.getSecond() == 0 && end.getSecond() == 0, "Use whole-minute times.");
    long minutes = java.time.Duration.between(start, end).toMinutes();
    require(
        minutes % duration == 0 && minutes / duration <= 100,
        "The time range must divide evenly into at most 100 slots.");
    require(
        db.list(
                "SELECT id FROM time_slots WHERE doctor_id=? AND date=? AND start_time<? AND"
                    + " end_time>?",
                doctor,
                date,
                end,
                start)
            .isEmpty(),
        "This availability overlaps existing slots.");
    for (LocalTime t = start; t.isBefore(end); ) {
      LocalTime next = t.plusMinutes(duration);
      db.insert(
          "INSERT INTO time_slots(doctor_id,date,start_time,end_time,booked) VALUES"
              + " (?,?,?,?,false)",
          doctor,
          date,
          t,
          next);
      t = next;
    }
    return Map.of("message", "Availability added.");
  }

  @DeleteMapping("/doctor/slots/{id}")
  @Transactional
  public Object deleteSlot(@PathVariable long id, HttpServletRequest r) {
    long doctor = doctor(r);
    db.one("SELECT id FROM doctors WHERE id=? FOR UPDATE", doctor);
    var s = db.one("SELECT * FROM time_slots WHERE id=? AND doctor_id=? FOR UPDATE", id, doctor);
    require(future(s), "Past slots cannot be removed.");
    require(
        db.list("SELECT id FROM appointments WHERE slot_id=?", id).isEmpty(),
        "Slots with appointment history cannot be deleted.");
    db.jdbc.update("DELETE FROM time_slots WHERE id=?", id);
    return Map.of("message", "Slot removed.");
  }

  @GetMapping("/admin/users")
  public Object users() {
    return db.list("SELECT id,name,email,role,active FROM users ORDER BY name");
  }

  @PutMapping("/admin/users/{id}")
  @Transactional
  public Object editUser(
      @PathVariable long id, @RequestBody Map<String, Object> b, HttpServletRequest r) {
    db.list("SELECT id FROM users WHERE role='ADMIN' ORDER BY id FOR UPDATE");
    var u = db.one("SELECT * FROM users WHERE id=? FOR UPDATE", id);
    boolean active = Boolean.TRUE.equals(b.get("active"));
    if (id == uid(r) && !active)
      throw ApiException.fail(409, "You cannot deactivate your own account.");
    if (u.get("role").equals("ADMIN") && !active)
      require(
          db.list("SELECT id FROM users WHERE role='ADMIN' AND active=true AND id<>?", id).size()
              > 0,
          "Keep at least one active administrator.");
    String role = b.containsKey("role") ? Db.text(b, "role", 20, true) : u.get("role").toString();
    require(Set.of("PATIENT", "ADMIN", "DOCTOR").contains(role), "Choose a valid role.");
    require(
        role.equals(u.get("role")) || (!role.equals("DOCTOR") && !u.get("role").equals("DOCTOR")),
        "Doctor roles are managed through doctor profiles.");
    if (u.get("role").equals("ADMIN") && !role.equals("ADMIN")) {
      require(id != uid(r), "You cannot remove your own administrator role.");
      require(
          !db.list("SELECT id FROM users WHERE role='ADMIN' AND active=true AND id<>?", id)
              .isEmpty(),
          "Keep at least one active administrator.");
    }
    if (!role.equals(u.get("role")))
      require(
          db.list("SELECT id FROM appointments WHERE patient_id=?", id).isEmpty(),
          "Accounts with patient history must retain their role.");
    db.jdbc.update(
        "UPDATE users SET name=?,active=?,role=? WHERE id=?",
        Db.text(b, "name", 255, true),
        active,
        role,
        id);
    if (!active) db.jdbc.update("DELETE FROM auth_sessions WHERE user_id=?", id);
    return Map.of("message", "User updated.");
  }

  @PostMapping("/admin/users")
  @Transactional
  public Object createUser(@RequestBody Map<String, Object> b) {
    uniqueEmail(b);
    String role = Db.text(b, "role", 20, true);
    if (!Set.of("ADMIN", "PATIENT").contains(role))
      throw ApiException.fail(400, "Create doctor accounts in doctor management.");
    return Map.of(
        "id",
        db.insert(
            "INSERT INTO users(name,email,password,role,active) VALUES (?,?,?,?,true)",
            Db.text(b, "name", 255, true),
            Accounts.email(b),
            auth.passwords.encode(Accounts.password(b)),
            role));
  }

  @PostMapping("/admin/departments")
  public Object addDepartment(@RequestBody Map<String, Object> b) {
    return Map.of(
        "id",
        db.insert(
            "INSERT INTO departments(name,description) VALUES (?,?)",
            Db.text(b, "name", 255, true),
            Db.text(b, "description", 255, false)));
  }

  @PutMapping("/admin/departments/{id}")
  public Object editDepartment(@PathVariable long id, @RequestBody Map<String, Object> b) {
    db.one("SELECT id FROM departments WHERE id=?", id);
    db.jdbc.update(
        "UPDATE departments SET name=?,description=? WHERE id=?",
        Db.text(b, "name", 255, true),
        Db.text(b, "description", 255, false),
        id);
    return Map.of("message", "Department updated.");
  }

  @DeleteMapping("/admin/departments/{id}")
  public Object deleteDepartment(@PathVariable long id) {
    db.one("SELECT id FROM departments WHERE id=?", id);
    db.jdbc.update("DELETE FROM departments WHERE id=?", id);
    return Map.of("message", "Department removed.");
  }

  @GetMapping("/admin/doctors")
  public Object allDoctors() {
    return db.list(
        "SELECT d.*,u.name,u.email,u.active,dp.name AS department_name FROM doctors d JOIN users u"
            + " ON u.id=d.user_id JOIN departments dp ON dp.id=d.department_id ORDER BY u.name");
  }

  @PostMapping("/admin/doctors")
  @Transactional
  public Object addDoctor(@RequestBody Map<String, Object> b) {
    uniqueEmail(b);
    long dept = Db.number(b, "departmentId");
    db.one("SELECT id FROM departments WHERE id=?", dept);
    long user =
        db.insert(
            "INSERT INTO users(name,email,password,role,active) VALUES (?,?,?,'DOCTOR',true)",
            Db.text(b, "name", 255, true),
            Accounts.email(b),
            auth.passwords.encode(Accounts.password(b)));
    long id =
        db.insert(
            "INSERT INTO doctors(user_id,department_id,specialization,phone) VALUES (?,?,?,?)",
            user,
            dept,
            Db.text(b, "specialization", 255, true),
            Db.text(b, "phone", 255, false));
    return Map.of("id", id);
  }

  @PutMapping("/admin/doctors/{id}")
  @Transactional
  public Object editDoctor(@PathVariable long id, @RequestBody Map<String, Object> b) {
    var d = db.one("SELECT * FROM doctors WHERE id=? FOR UPDATE", id);
    long dept = Db.number(b, "departmentId");
    db.one("SELECT id FROM departments WHERE id=?", dept);
    db.jdbc.update(
        "UPDATE doctors SET department_id=?,specialization=?,phone=? WHERE id=?",
        dept,
        Db.text(b, "specialization", 255, true),
        Db.text(b, "phone", 255, false),
        id);
    db.jdbc.update(
        "UPDATE users SET name=?,active=? WHERE id=?",
        Db.text(b, "name", 255, true),
        Boolean.TRUE.equals(b.get("active")),
        Db.id(d, "user_id"));
    if (!Boolean.TRUE.equals(b.get("active")))
      db.jdbc.update("DELETE FROM auth_sessions WHERE user_id=?", Db.id(d, "user_id"));
    return Map.of("message", "Doctor updated.");
  }

  @GetMapping("/{role:patient|doctor|admin}/dashboard")
  public Object dashboard(@PathVariable String role, HttpServletRequest r) {
    String filter =
        switch (role) {
          case "patient" -> " WHERE a.patient_id=" + uid(r);
          case "doctor" -> " WHERE a.doctor_id=" + doctor(r);
          default -> " WHERE 1=1";
        };
    var counts =
        db.list(
            "SELECT a.status,COUNT(*) AS total FROM appointments a"
                + filter
                + " GROUP BY a.status");
    var upcoming =
        db.list(
            APPOINTMENTS
                + filter
                + " AND a.status IN ('PENDING','CONFIRMED') AND (s.date>? OR (s.date=? AND"
                + " s.start_time>=?)) ORDER BY s.date,s.start_time LIMIT 10",
            now().toLocalDate(),
            now().toLocalDate(),
            now().toLocalTime());
    for (var a : upcoming) {
      a.remove("patient_email");
      a.remove("diagnosis");
      a.remove("prescription");
      a.remove("ai_summary");
      a.remove("follow_up");
    }
    return Map.of(
        "counts",
        counts,
        "upcoming",
        upcoming,
        "timezone",
        zone.toString(),
        "emailEnabled",
        mail.enabled());
  }

  void uniqueEmail(Map<String, Object> b) {
    if (!db.list("SELECT id FROM users WHERE LOWER(email)=?", Accounts.email(b)).isEmpty())
      throw ApiException.fail(409, "An account with that email already exists.");
  }

  @GetMapping("/admin/notifications")
  public Object notifications() {
    return db.list(
        "SELECT id,subject,sent_at,attempts,created_at FROM email_outbox ORDER BY id DESC LIMIT"
            + " 100");
  }

  @PostMapping("/patient/health-assistant")
  public Object assistant(@RequestBody Map<String, Object> b, HttpServletRequest r) {
    return assistant.answer(uid(r), b);
  }
}
