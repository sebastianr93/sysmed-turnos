package com.medical.appointment.controller;

import com.medical.appointment.dto.request.TurnoRequest;
import com.medical.appointment.dto.response.TurnoResponse;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.service.TurnoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/turnos")
@RequiredArgsConstructor
@Tag(name = "Turnos", description = "Gestión de turnos médicos")
public class TurnoController {

    private final TurnoService turnoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los turnos (ADMIN)")
    public ResponseEntity<List<TurnoResponse>> findAll() {
        return ResponseEntity.ok(turnoService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener turno por ID")
    public ResponseEntity<TurnoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(turnoService.findById(id));
    }

    @GetMapping("/mis-turnos")
    @PreAuthorize("hasRole('PACIENTE')")
    @Operation(summary = "Ver mis turnos (PACIENTE)")
    public ResponseEntity<List<TurnoResponse>> misTurnos(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(turnoService.findByPaciente(user.getUsername()));
    }

    @GetMapping("/agenda")
    @PreAuthorize("hasRole('MEDICO')")
    @Operation(summary = "Ver agenda del médico (MEDICO)")
    public ResponseEntity<List<TurnoResponse>> agenda(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(turnoService.findByMedico(user.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    @Operation(summary = "Reservar turno (PACIENTE)")
    public ResponseEntity<TurnoResponse> reservar(
            @Valid @RequestBody TurnoRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(turnoService.reservar(request, user.getUsername()));
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('PACIENTE', 'ADMIN')")
    @Operation(summary = "Cancelar turno (PACIENTE o ADMIN)")
    public ResponseEntity<TurnoResponse> cancelar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        // Determine role from authorities
        Rol rol = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? Rol.ADMIN : Rol.PACIENTE;
        return ResponseEntity.ok(turnoService.cancelar(id, user.getUsername(), rol));
    }

    @PutMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('MEDICO')")
    @Operation(summary = "Confirmar turno (MEDICO)")
    public ResponseEntity<TurnoResponse> confirmar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(turnoService.confirmar(id, user.getUsername()));
    }

    @PutMapping("/{id}/completar")
    @PreAuthorize("hasRole('MEDICO')")
    @Operation(summary = "Completar turno (MEDICO)")
    public ResponseEntity<TurnoResponse> completar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(turnoService.completar(id, user.getUsername()));
    }
}
