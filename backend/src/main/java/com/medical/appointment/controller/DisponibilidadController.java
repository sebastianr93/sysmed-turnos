package com.medical.appointment.controller;

import com.medical.appointment.dto.request.DisponibilidadRequest;
import com.medical.appointment.dto.response.DisponibilidadResponse;
import com.medical.appointment.service.DisponibilidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disponibilidades")
@RequiredArgsConstructor
@Tag(name = "Disponibilidades", description = "Gestión de disponibilidad de médicos")
public class DisponibilidadController {

    private final DisponibilidadService disponibilidadService;

    @GetMapping("/medico/{medicoId}")
    @Operation(summary = "Ver disponibilidades de un médico")
    public ResponseEntity<List<DisponibilidadResponse>> findByMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(disponibilidadService.findByMedico(medicoId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    @Operation(summary = "Crear disponibilidad (ADMIN o MEDICO)")
    public ResponseEntity<DisponibilidadResponse> create(@Valid @RequestBody DisponibilidadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(disponibilidadService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    @Operation(summary = "Eliminar disponibilidad (ADMIN o MEDICO)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        disponibilidadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
