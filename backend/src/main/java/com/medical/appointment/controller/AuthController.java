package com.medical.appointment.controller;

import com.medical.appointment.dto.request.LoginRequest;
import com.medical.appointment.dto.request.RegisterRequest;
import com.medical.appointment.dto.response.AuthResponse;
import com.medical.appointment.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints de autenticación")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo paciente")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
