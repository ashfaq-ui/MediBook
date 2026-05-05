package com.MediBook.backend.ai;

import com.MediBook.backend.model.Appointment;
import com.MediBook.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AppointmentSummaryService {

    private final ClaudeApiClient claudeApiClient;
    private final AppointmentRepository appointmentRepository;

    public AppointmentSummaryService(ClaudeApiClient claudeApiClient,
                                     AppointmentRepository appointmentRepository) {
        this.claudeApiClient = claudeApiClient;
        this.appointmentRepository = appointmentRepository;
    }

    private static final String SYSTEM_PROMPT = """
            You are a medical documentation assistant for MediBook, a clinic management system.
            Your job is to convert a doctor's raw appointment notes into a clean, structured
            clinical summary.

            Always output in this exact format:

            **Patient:** [name]
            **Date:** [date]
            **Doctor:** [name]

            **Chief Complaint:**
            [1-2 sentences]

            **Clinical Notes:**
            [Bullet points from doctor's notes]

            **Assessment:**
            [Brief assessment based on notes]

            **Recommended Follow-up:**
            [Follow-up actions, referrals, or next steps]

            **Disclaimer:** This summary is AI-generated and should be reviewed by the treating physician.
            """;

    public String generateSummary(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));

        String userMessage = String.format("""
                Please generate a clinical summary for the following appointment:

                Patient: %s
                Doctor: %s
                Date: %s
                Notes: %s
                """,
            appointment.getPatient().getName(),
            appointment.getDoctor().getUser().getName(),
            appointment.getSlot().getDate().toString(),
            appointment.getNotes() != null ? appointment.getNotes() : "No notes provided"
        );

        List<Map<String, String>> messages = List.of(
            Map.of("role", "user", "content", userMessage)
        );

        String summary = claudeApiClient.chat(SYSTEM_PROMPT, messages);

        appointment.setAiSummary(summary);
        appointmentRepository.save(appointment);

        return summary;
    }
}
