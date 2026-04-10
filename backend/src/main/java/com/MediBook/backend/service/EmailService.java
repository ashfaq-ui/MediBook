package com.MediBook.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from:onboarding@resend.dev}")
    private String fromEmail;

    @Async
    public void sendBookingConfirmation(String toEmail, String patientName,
            String doctorName, String department,
            String date, String startTime, String endTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("MediBook — Appointment Confirmation");
            message.setText(
                    "Dear " + patientName + ",\n\n"
                    + "Your appointment has been successfully booked!\n\n"
                    + "Appointment Details:\n"
                    + "───────────────────────\n"
                    + "Doctor     : Dr. " + doctorName + "\n"
                    + "Department : " + department + "\n"
                    + "Date       : " + date + "\n"
                    + "Time       : " + startTime + " - " + endTime + "\n"
                    + "Status     : PENDING\n"
                    + "───────────────────────\n\n"
                    + "Please arrive 10 minutes before your appointment.\n\n"
                    + "If you need to cancel, please do so at least 2 hours before.\n\n"
                    + "Thank you for choosing MediBook!\n"
                    + "MediBook Team"
            );
            mailSender.send(message);
            log.info("Booking confirmation sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send booking confirmation to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Async
    public void sendCancellationEmail(String toEmail, String patientName,
            String doctorName, String date, String startTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("MediBook — Appointment Cancelled");
            message.setText(
                    "Dear " + patientName + ",\n\n"
                    + "Your appointment has been cancelled.\n\n"
                    + "Cancelled Appointment:\n"
                    + "───────────────────────\n"
                    + "Doctor : Dr. " + doctorName + "\n"
                    + "Date   : " + date + "\n"
                    + "Time   : " + startTime + "\n"
                    + "───────────────────────\n\n"
                    + "You can book a new appointment anytime on MediBook.\n\n"
                    + "Thank you,\n"
                    + "MediBook Team"
            );
            mailSender.send(message);
            log.info("Cancellation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send cancellation email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Async
    public void sendStatusUpdateEmail(String toEmail, String patientName,
            String doctorName, String date,
            String startTime, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("MediBook — Appointment " + status);
            message.setText(
                    "Dear " + patientName + ",\n\n"
                    + "Your appointment status has been updated.\n\n"
                    + "Appointment Details:\n"
                    + "───────────────────────\n"
                    + "Doctor : Dr. " + doctorName + "\n"
                    + "Date   : " + date + "\n"
                    + "Time   : " + startTime + "\n"
                    + "Status : " + status + "\n"
                    + "───────────────────────\n\n"
                    + "Thank you,\n"
                    + "MediBook Team"
            );
            mailSender.send(message);
            log.info("Status update email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send status update email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
