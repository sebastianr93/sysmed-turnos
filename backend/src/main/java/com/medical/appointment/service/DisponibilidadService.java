package com.medical.appointment.service;

import com.medical.appointment.dto.request.DisponibilidadRequest;
import com.medical.appointment.dto.response.DisponibilidadResponse;
import com.medical.appointment.entity.Disponibilidad;
import com.medical.appointment.entity.Medico;
import com.medical.appointment.exception.BusinessRuleException;
import com.medical.appointment.exception.ResourceNotFoundException;
import com.medical.appointment.repository.DisponibilidadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisponibilidadService {

    private final DisponibilidadRepository disponibilidadRepository;
    private final MedicoService medicoService;

    @Transactional(readOnly = true)
    public List<DisponibilidadResponse> findByMedico(Long medicoId) {
        return disponibilidadRepository
                .findByMedicoIdAndFechaGreaterThanEqualOrderByFechaAscHoraInicioAsc(medicoId, LocalDate.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DisponibilidadResponse create(DisponibilidadRequest request) {
        Medico medico = medicoService.getById(request.getMedicoId());

        if (request.getHoraInicio().isAfter(request.getHoraFin()) ||
            request.getHoraInicio().equals(request.getHoraFin())) {
            throw new BusinessRuleException("La hora de inicio debe ser anterior a la hora de fin");
        }

        boolean solapamiento = disponibilidadRepository.existsSolapamiento(
                medico.getId(),
                request.getFecha(),
                request.getHoraInicio(),
                request.getHoraFin(),
                null);

        if (solapamiento) {
            throw new BusinessRuleException("El horario se superpone con una disponibilidad existente");
        }

        Disponibilidad disponibilidad = Disponibilidad.builder()
                .medico(medico)
                .fecha(request.getFecha())
                .horaInicio(request.getHoraInicio())
                .horaFin(request.getHoraFin())
                .build();

        disponibilidad = disponibilidadRepository.save(disponibilidad);
        log.info("Disponibilidad created for medico {} on {}", medico.getId(), request.getFecha());
        return toResponse(disponibilidad);
    }

    @Transactional
    public void delete(Long id) {
        Disponibilidad d = disponibilidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disponibilidad", id));
        disponibilidadRepository.delete(d);
    }

    private DisponibilidadResponse toResponse(Disponibilidad d) {
        return DisponibilidadResponse.builder()
                .id(d.getId())
                .medicoId(d.getMedico().getId())
                .medicoNombre(d.getMedico().getUsuario().getNombre() + " " + d.getMedico().getUsuario().getApellido())
                .fecha(d.getFecha())
                .horaInicio(d.getHoraInicio())
                .horaFin(d.getHoraFin())
                .build();
    }
}
