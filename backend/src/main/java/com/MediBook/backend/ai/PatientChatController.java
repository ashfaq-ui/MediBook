package com.MediBook.backend.ai;

import com.MediBook.backend.ai.dto.ChatRequest;
import com.MediBook.backend.ai.dto.ChatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class PatientChatController {

    private final PatientChatService patientChatService;

    public PatientChatController(PatientChatService patientChatService) {
        this.patientChatService = patientChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = patientChatService.chat(request);
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
