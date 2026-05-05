package com.MediBook.backend.ai;

import com.MediBook.backend.ai.dto.ChatRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PatientChatService {

    private final GeminiApiClient geminiApiClient;

    public PatientChatService(GeminiApiClient geminiApiClient) {
        this.geminiApiClient = geminiApiClient;
    }

    private static final String SYSTEM_PROMPT = """
            You are MediBook's AI Health Assistant. You help patients understand their symptoms,
            learn about conditions, and prepare for their appointments.

            Rules:
            - Be empathetic, clear, and concise.
            - Never diagnose conditions. Always recommend seeing a doctor for diagnosis.
            - If symptoms sound urgent or emergency-level (chest pain, difficulty breathing,
              severe bleeding), immediately advise the patient to call emergency services.
            - Do not prescribe medications or dosages.
            - Keep responses under 250 words unless the patient asks for detail.
            - You may suggest which type of doctor to see (e.g., cardiologist, dermatologist).
            """;

    public String chat(ChatRequest request) {
        return geminiApiClient.chat(SYSTEM_PROMPT, request.getMessages());
    }
}
