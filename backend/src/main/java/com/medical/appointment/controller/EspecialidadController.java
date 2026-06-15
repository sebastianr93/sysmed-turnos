package com.medical.appointment.controller;

import com.medical.appointment.dto.request.EspecialidadRequest;
import com.medical.appointment.dto.response.EspecialidadResponse;
import com.medical.appointment.service.EspecialidadService;
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
@RequestMapping("/especialidades")
@RequiredArgsConstructor
@Tag(name = "Especialidades", description = "Gestión de especialidades médicas")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    @GetMapping
    @Operation(summary = "Listar todas las especialidades")
    public ResponseEntity<List<EspecialidadResponse>> findAll() {
        return ResponseEntity.ok(especialidadService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener especialidad por ID")
    public ResponseEntity<EspecialidadResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(especialidadService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear especialidad (ADMIN)")
    public ResponseEntity<EspecialidadResponse> create(@Valid @RequestBody EspecialidadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(especialidadService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar especialidad (ADMIN)")
    public ResponseEntity<EspecialidadResponse> update(
            @PathVariable Long id, @Valid @RequestBody EspecialidadRequest request) {
        return ResponseEntity.ok(especialidadService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar especialidad (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        especialidadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
