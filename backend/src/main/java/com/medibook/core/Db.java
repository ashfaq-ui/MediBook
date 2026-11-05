package com.medibook.core;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class Db {
  public final JdbcTemplate jdbc;

  public Db(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public List<Map<String, Object>> list(String sql, Object... args) {
    return jdbc.query(
        sql,
        (rs, n) -> {
          Map<String, Object> row = new LinkedHashMap<>();
          for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
            Object v = rs.getObject(i);
            if (v instanceof java.sql.Date
                || v instanceof java.sql.Time
                || v instanceof java.sql.Timestamp) v = v.toString();
            row.put(rs.getMetaData().getColumnLabel(i).toLowerCase(Locale.ROOT), v);
          }
          return row;
        },
        args);
  }

  public Map<String, Object> one(String sql, Object... args) {
    var rows = list(sql, args);
    if (rows.isEmpty()) throw ApiException.fail(404, "Record not found.");
    return rows.get(0);
  }

  public long insert(String sql, Object... args) {
    var key = new org.springframework.jdbc.support.GeneratedKeyHolder();
    jdbc.update(
        c -> {
          var ps = c.prepareStatement(sql, new String[] {"id"});
          for (int i = 0; i < args.length; i++) ps.setObject(i + 1, args[i]);
          return ps;
        },
        key);
    return Objects.requireNonNull(key.getKey()).longValue();
  }

  public static long id(Map<String, Object> row, String key) {
    return ((Number) row.get(key)).longValue();
  }

  public static String text(Map<String, Object> body, String key, int max, boolean required) {
    Object v = body.get(key);
    String s = v == null ? "" : v.toString().trim();
    if ((required && s.isBlank()) || s.length() > max)
      throw ApiException.fail(400, "Invalid " + key + ".");
    return s;
  }

  public static long number(Map<String, Object> body, String key) {
    try {
      long n = Long.parseLong(String.valueOf(body.get(key)));
      if (n <= 0) throw new IllegalArgumentException();
      return n;
    } catch (Exception e) {
      throw ApiException.fail(400, "Choose a valid " + key + ".");
    }
  }
}
