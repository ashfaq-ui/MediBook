package com.MediBook.backend.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AppointmentSummaryController {

    private final AppointmentSummaryService summaryService;

    public AppointmentSummaryController(AppointmentSummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @PostMapping("/summary/{appointmentId}")
    public ResponseEntity<Map<String, String>> generateSummary(
            @PathVariable Long appointmentId) {

        String summary = summaryService.generateSummary(appointmentId);
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}
