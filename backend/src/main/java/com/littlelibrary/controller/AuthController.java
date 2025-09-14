package com.littlelibrary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        // Simplified authentication for MVP
        // In production, implement proper JWT authentication with Spring Security
        if (email != null && password != null) {
            return ResponseEntity.ok(Map.of(
                "token", "mock-jwt-token",
                "user", Map.of(
                    "id", 1L,
                    "email", email,
                    "firstName", "John",
                    "lastName", "Doe"
                )
            ));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> registerRequest) {
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String firstName = registerRequest.get("firstName");
        String lastName = registerRequest.get("lastName");
        
        // Simplified registration for MVP
        if (email != null && password != null && firstName != null && lastName != null) {
            return ResponseEntity.ok(Map.of(
                "token", "mock-jwt-token",
                "user", Map.of(
                    "id", 1L,
                    "email", email,
                    "firstName", firstName,
                    "lastName", lastName
                )
            ));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
