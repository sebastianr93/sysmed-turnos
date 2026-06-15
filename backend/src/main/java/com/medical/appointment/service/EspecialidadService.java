package com.medical.appointment.service;

import com.medical.appointment.dto.request.EspecialidadRequest;
import com.medical.appointment.dto.response.EspecialidadResponse;
import com.medical.appointment.entity.Especialidad;
import com.medical.appointment.exception.DuplicateResourceException;
import com.medical.appointment.exception.ResourceNotFoundException;
import com.medical.appointment.repository.EspecialidadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    @Transactional(readOnly = true)
    public List<EspecialidadResponse> findAll() {
        return especialidadRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EspecialidadResponse findById(Long id) {
        return toResponse(getById(id));
    }

    @Transactional
    public EspecialidadResponse create(EspecialidadRequest request) {
        if (especialidadRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new DuplicateResourceException("Ya existe una especialidad con el nombre: " + request.getNombre());
        }

        Especialidad especialidad = Especialidad.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .build();

        especialidad = especialidadRepository.save(especialidad);
        log.info("Especialidad created: {}", especialidad.getNombre());
        return toResponse(especialidad);
    }

    @Transactional
    public EspecialidadResponse update(Long id, EspecialidadRequest request) {
        Especialidad especialidad = getById(id);
        especialidad.setNombre(request.getNombre());
        especialidad.setDescripcion(request.getDescripcion());
        return toResponse(especialidadRepository.save(especialidad));
    }

    @Transactional
    public void delete(Long id) {
        Especialidad especialidad = getById(id);
        especialidadRepository.delete(especialidad);
        log.info("Especialidad deleted: {}", id);
    }

    public Especialidad getById(Long id) {
        return especialidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad", id));
    }

    private EspecialidadResponse toResponse(Especialidad e) {
        return EspecialidadResponse.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .descripcion(e.getDescripcion())
                .build();
    }
}
