package com.medical.appointment.controller;

import com.medical.appointment.dto.request.MedicoRequest;
import com.medical.appointment.dto.response.MedicoResponse;
import com.medical.appointment.service.MedicoService;
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
@RequestMapping("/medicos")
@RequiredArgsConstructor
@Tag(name = "Médicos", description = "Gestión de médicos")
public class MedicoController {

    private final MedicoService medicoService;

    @GetMapping
    @Operation(summary = "Listar médicos activos")
    public ResponseEntity<List<MedicoResponse>> findAll() {
        return ResponseEntity.ok(medicoService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener médico por ID")
    public ResponseEntity<MedicoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.findById(id));
    }

    @GetMapping("/especialidad/{especialidadId}")
    @Operation(summary = "Listar médicos por especialidad")
    public ResponseEntity<List<MedicoResponse>> findByEspecialidad(@PathVariable Long especialidadId) {
        return ResponseEntity.ok(medicoService.findByEspecialidad(especialidadId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear médico (ADMIN)")
    public ResponseEntity<MedicoResponse> create(@Valid @RequestBody MedicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar médico (ADMIN)")
    public ResponseEntity<MedicoResponse> update(
            @PathVariable Long id, @Valid @RequestBody MedicoRequest request) {
        return ResponseEntity.ok(medicoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar médico (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
