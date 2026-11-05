package com.medibook;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.medibook.core.*;
import jakarta.servlet.http.Cookie;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:core;DB_CLOSE_DELAY=-1",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "app.mail-enabled=false",
      "app.admin-email=",
      "app.admin-password="
    })
class BackendApplicationTests {
  @Autowired MockMvc mvc;
  @Autowired Db db;
  @Autowired ObjectMapper mapper;
  @Autowired Schema schema;
  Cookie admin, doctor, patient, other;
  long doctorId, department;

  String json(Object v) {
    return mapper.writeValueAsString(v);
  }

  org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request(
      String path, Object body, Cookie cookie) {
    var r =
        post(path)
            .header("X-Requested-With", "MediBook")
            .contentType("application/json")
            .content(json(body))
            .with(
                req -> {
                  req.setRemoteAddr(UUID.randomUUID().toString());
                  return req;
                });
    if (cookie != null) r.cookie(cookie);
    return r;
  }

  MvcResult postOk(String path, Object body, Cookie cookie) throws Exception {
    return mvc.perform(request(path, body, cookie)).andExpect(status().isOk()).andReturn();
  }

  long id(MvcResult r) throws Exception {
    return mapper.readTree(r.getResponse().getContentAsString()).get("id").asLong();
  }

  Cookie login(String email) throws Exception {
    return MockCookie.parse(
        postOk("/api/auth/login", Map.of("email", email, "password", "TestPassword123"), null)
            .getResponse()
            .getHeader("Set-Cookie"));
  }

  @BeforeEach
  void setup() throws Exception {
    for (String table :
        List.of(
            "email_outbox",
            "password_resets",
            "auth_sessions",
            "appointments",
            "time_slots",
            "doctors",
            "departments",
            "users")) db.jdbc.update("DELETE FROM " + table);
    db.insert(
        "INSERT INTO users(email,name,password,role,active) VALUES (?,?,?,'ADMIN',true)",
        "admin@test.example",
        "Admin",
        new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(4)
            .encode("TestPassword123"));
    admin = login("admin@test.example");
    department =
        id(
            postOk(
                "/api/admin/departments",
                Map.of("name", "Cardiology", "description", "Heart clinic"),
                admin));
    doctorId =
        id(
            postOk(
                "/api/admin/doctors",
                Map.of(
                    "name",
                    "Doctor",
                    "email",
                    "doctor@test.example",
                    "password",
                    "TestPassword123",
                    "departmentId",
                    department,
                    "specialization",
                    "Cardiology"),
                admin));
    doctor = login("doctor@test.example");
    patient = register("patient@test.example");
    other = register("other@test.example");
  }

  Cookie register(String email) throws Exception {
    return MockCookie.parse(
        postOk(
                "/api/auth/register",
                Map.of(
                    "name",
                    "Patient",
                    "email",
                    email,
                    "password",
                    "TestPassword123",
                    "confirmPassword",
                    "TestPassword123",
                    "role",
                    "ADMIN"),
                null)
            .getResponse()
            .getHeader("Set-Cookie"));
  }

  long slot(String time) throws Exception {
    LocalTime start = LocalTime.parse(time);
    postOk(
        "/api/doctor/slots",
        Map.of(
            "date",
            LocalDate.now(ZoneId.of("Asia/Colombo")).plusDays(3).toString(),
            "startTime",
            time,
            "endTime",
            start.plusMinutes(30).toString(),
            "duration",
            30),
        doctor);
    return Db.id(
        db.one("SELECT id FROM time_slots WHERE doctor_id=? AND start_time=?", doctorId, start),
        "id");
  }

  @Test
  void accountsAndPermissions() throws Exception {
    mvc.perform(get("/api/auth/me").cookie(patient)).andExpect(jsonPath("$.role").value("PATIENT"));
    mvc.perform(get("/api/admin/users").cookie(patient)).andExpect(status().isForbidden());
    mvc.perform(get("/api/doctor/slots").cookie(patient)).andExpect(status().isForbidden());
    mvc.perform(get("/api/patient/appointments")).andExpect(status().isUnauthorized());
    mvc.perform(post("/api/auth/login").contentType("application/json").content("{}"))
        .andExpect(status().isForbidden());
    mvc.perform(
            request(
                "/api/auth/login",
                Map.of("email", "patient@test.example", "password", "wrong"),
                null))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            request(
                "/api/auth/register",
                Map.of(
                    "name",
                    "Duplicate",
                    "email",
                    "PATIENT@test.example",
                    "password",
                    "TestPassword123",
                    "confirmPassword",
                    "TestPassword123"),
                null))
        .andExpect(status().isConflict());
    postOk("/api/auth/logout", Map.of(), patient);
    mvc.perform(get("/api/auth/me").cookie(patient)).andExpect(status().isUnauthorized());
  }

  @Test
  void bookingCancellationReschedulingAndSummary() throws Exception {
    long first = slot("09:00"), second = slot("10:00");
    long appointment =
        id(
            postOk(
                "/api/patient/appointments", Map.of("slotId", first, "notes", "Checkup"), patient));
    mvc.perform(request("/api/patient/appointments", Map.of("slotId", first), other))
        .andExpect(status().isConflict());
    mvc.perform(request("/api/patient/appointments/" + appointment + "/cancel", Map.of(), other))
        .andExpect(status().isNotFound());
    postOk(
        "/api/patient/appointments/" + appointment + "/reschedule",
        Map.of("slotId", second),
        patient);
    assertThat(db.one("SELECT booked FROM time_slots WHERE id=?", first).get("booked"))
        .isEqualTo(false);
    long rebooked = id(postOk("/api/patient/appointments", Map.of("slotId", first), other));
    postOk("/api/patient/appointments/" + rebooked + "/cancel", Map.of(), other);
    postOk("/api/patient/appointments", Map.of("slotId", first), patient);
    mvc.perform(
            put("/api/doctor/appointments/" + appointment + "/summary")
                .cookie(doctor)
                .header("X-Requested-With", "MediBook")
                .contentType("application/json")
                .content(json(Map.of("diagnosis", "Private notes", "shared", false))))
        .andExpect(status().isOk());
    mvc.perform(get("/api/patient/appointments").cookie(patient))
        .andExpect(jsonPath("$[?(@.diagnosis == 'Private notes')]").isEmpty());
    mvc.perform(
            request(
                "/api/doctor/appointments/" + appointment + "/complete",
                Map.of("diagnosis", "Final notes", "shared", true),
                doctor))
        .andExpect(status().isConflict());
    db.jdbc.update(
        "UPDATE time_slots SET date=? WHERE id=?",
        LocalDate.now(ZoneId.of("Asia/Colombo")).minusDays(1),
        second);
    postOk(
        "/api/doctor/appointments/" + appointment + "/complete",
        Map.of("diagnosis", "Final notes", "prescription", "Follow instructions", "shared", true),
        doctor);
    mvc.perform(get("/api/patient/appointments").cookie(patient))
        .andExpect(jsonPath("$[?(@.diagnosis == 'Final notes')]").isNotEmpty());
    mvc.perform(request("/api/patient/appointments/" + appointment + "/cancel", Map.of(), patient))
        .andExpect(status().isConflict());
  }

  @Test
  void concurrentBookingsHaveOnlyOneWinner() throws Exception {
    long slot = slot("11:00");
    var pool = Executors.newFixedThreadPool(2);
    var latch = new CountDownLatch(1);
    try {
      List<Future<Integer>> futures = new ArrayList<>();
      for (var cookie : List.of(patient, other))
        futures.add(
            pool.submit(
                () -> {
                  latch.await();
                  return mvc.perform(
                          request("/api/patient/appointments", Map.of("slotId", slot), cookie))
                      .andReturn()
                      .getResponse()
                      .getStatus();
                }));
      latch.countDown();
      var statuses = new ArrayList<Integer>();
      for (var future : futures) statuses.add(future.get(15, TimeUnit.SECONDS));
      assertThat(statuses).containsExactlyInAnyOrder(200, 409);
      assertThat(
              db.jdbc.queryForObject(
                  "SELECT COUNT(*) FROM appointments WHERE slot_id=?", Integer.class, slot))
          .isEqualTo(1);
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  void scheduleAndAdminValidation() throws Exception {
    long slot = slot("12:00");
    mvc.perform(
            request(
                "/api/doctor/slots",
                Map.of(
                    "date",
                    LocalDate.now().plusDays(3).toString(),
                    "startTime",
                    "12:15",
                    "endTime",
                    "12:45",
                    "duration",
                    30),
                doctor))
        .andExpect(status().isConflict());
    mvc.perform(
            delete("/api/admin/departments/" + department)
                .cookie(admin)
                .header("X-Requested-With", "MediBook"))
        .andExpect(status().isConflict());
    postOk("/api/patient/appointments", Map.of("slotId", slot), patient);
    mvc.perform(
            delete("/api/doctor/slots/" + slot)
                .cookie(doctor)
                .header("X-Requested-With", "MediBook"))
        .andExpect(status().isConflict());
    long patientId = Db.id(db.one("SELECT id FROM users WHERE email='patient@test.example'"), "id");
    mvc.perform(
            put("/api/admin/users/" + patientId)
                .cookie(admin)
                .header("X-Requested-With", "MediBook")
                .contentType("application/json")
                .content(json(Map.of("name", "Patient", "active", false))))
        .andExpect(status().isOk());
    mvc.perform(get("/api/auth/me").cookie(patient)).andExpect(status().isUnauthorized());
    schema.afterPropertiesSet();
    assertThat(db.jdbc.queryForObject("SELECT COUNT(*) FROM appointments", Integer.class))
        .isEqualTo(1);
    assertThat(db.jdbc.queryForObject("SELECT COUNT(*) FROM medibook_migrations", Integer.class))
        .isEqualTo(1);
  }

  @Test
  void resetTokensExpireAndAreSingleUse() throws Exception {
    long id = Db.id(db.one("SELECT id FROM users WHERE email='patient@test.example'"), "id");
    db.jdbc.update(
        "INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES (?,?,?)",
        Auth.hash("expired"),
        id,
        java.sql.Timestamp.from(Instant.now().minusSeconds(1)));
    var body =
        Map.of(
            "token", "expired", "password", "NewPassword123", "confirmPassword", "NewPassword123");
    mvc.perform(request("/api/auth/reset-password", body, null)).andExpect(status().isBadRequest());
    db.jdbc.update(
        "UPDATE password_resets SET expires_at=?",
        java.sql.Timestamp.from(Instant.now().plusSeconds(600)));
    postOk("/api/auth/reset-password", body, null);
    mvc.perform(request("/api/auth/reset-password", body, null)).andExpect(status().isBadRequest());
    mvc.perform(get("/api/auth/me").cookie(patient)).andExpect(status().isUnauthorized());
  }

  @Test
  void passwordChangesAndNoShows() throws Exception {
    long slot = slot("14:00");
    long appointment = id(postOk("/api/patient/appointments", Map.of("slotId", slot), patient));
    mvc.perform(request("/api/doctor/appointments/" + appointment + "/no-show", Map.of(), doctor))
        .andExpect(status().isConflict());
    db.jdbc.update(
        "UPDATE time_slots SET date=? WHERE id=?",
        LocalDate.now(ZoneId.of("Asia/Colombo")).minusDays(1),
        slot);
    postOk("/api/doctor/appointments/" + appointment + "/no-show", Map.of(), doctor);
    assertThat(db.one("SELECT status FROM appointments WHERE id=?", appointment).get("status"))
        .isEqualTo("NO_SHOW");
    mvc.perform(
            request(
                "/api/auth/change-password",
                Map.of(
                    "currentPassword",
                    "incorrect",
                    "password",
                    "NewPassword123",
                    "confirmPassword",
                    "NewPassword123"),
                patient))
        .andExpect(status().isBadRequest());
    Cookie old = patient;
    var result =
        postOk(
            "/api/auth/change-password",
            Map.of(
                "currentPassword",
                "TestPassword123",
                "password",
                "NewPassword123",
                "confirmPassword",
                "NewPassword123"),
            patient);
    Cookie renewed = MockCookie.parse(result.getResponse().getHeader("Set-Cookie"));
    mvc.perform(get("/api/auth/me").cookie(old)).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/auth/me").cookie(renewed)).andExpect(status().isOk());
  }
}
