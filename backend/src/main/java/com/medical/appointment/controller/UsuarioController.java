package com.medical.appointment.controller;

import com.medical.appointment.dto.request.ActualizarPerfilRequest;
import com.medical.appointment.dto.request.CambiarPasswordRequest;
import com.medical.appointment.dto.response.UsuarioResponse;
import com.medical.appointment.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de perfil de usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/perfil")
    @Operation(summary = "Obtener perfil del usuario logueado")
    public ResponseEntity<UsuarioResponse> getPerfil(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(usuarioService.getPerfil(user.getUsername()));
    }

    @PutMapping("/perfil")
    @Operation(summary = "Actualizar perfil del usuario logueado")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(user.getUsername(), request));
    }

    @PutMapping("/cambiar-password")
    @Operation(summary = "Cambiar contraseña del usuario logueado")
    public ResponseEntity<Void> cambiarPassword(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CambiarPasswordRequest request) {
        usuarioService.cambiarPassword(user.getUsername(), request);
        return ResponseEntity.ok().build();
    }
}
