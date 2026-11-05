package com.medibook.core;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiException {
  public static class Failure extends RuntimeException {
    final HttpStatus status;

    public Failure(int status, String message) {
      super(message);
      this.status = HttpStatus.valueOf(status);
    }
  }

  public static Failure fail(int status, String message) {
    return new Failure(status, message);
  }

  @ExceptionHandler(Failure.class)
  @ResponseBody
  public org.springframework.http.ResponseEntity<?> handle(Failure e) {
    return org.springframework.http.ResponseEntity.status(e.status)
        .body(Map.of("message", e.getMessage()));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public org.springframework.http.ResponseEntity<?> conflict(Exception e) {
    return org.springframework.http.ResponseEntity.status(409)
        .body(Map.of("message", "This change conflicts with an existing or linked record."));
  }

  @ExceptionHandler({
    IllegalArgumentException.class,
    MethodArgumentTypeMismatchException.class,
    HttpMessageNotReadableException.class
  })
  public org.springframework.http.ResponseEntity<?> invalid(Exception e) {
    return org.springframework.http.ResponseEntity.badRequest()
        .body(Map.of("message", "Invalid request. Check all required fields and dates."));
  }
}
