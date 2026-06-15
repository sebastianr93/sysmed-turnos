package com.medical.appointment.service;

import com.medical.appointment.dto.request.TurnoRequest;
import com.medical.appointment.dto.response.TurnoResponse;
import com.medical.appointment.entity.Medico;
import com.medical.appointment.entity.Paciente;
import com.medical.appointment.entity.Turno;
import com.medical.appointment.enums.EstadoTurno;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.exception.BusinessRuleException;
import com.medical.appointment.exception.ResourceNotFoundException;
import com.medical.appointment.repository.PacienteRepository;
import com.medical.appointment.repository.TurnoRepository;
import com.medical.appointment.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TurnoService {

    private final TurnoRepository turnoRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoService medicoService;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<TurnoResponse> findAll() {
        return turnoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TurnoResponse findById(Long id) {
        return toResponse(getById(id));
    }

    @Transactional(readOnly = true)
    public List<TurnoResponse> findByPaciente(String email) {
        Paciente paciente = getPacienteByEmail(email);
        return turnoRepository.findByPacienteIdOrderByFechaHoraDesc(paciente.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TurnoResponse> findByMedico(String email) {
        Medico medico = medicoService.getByUsuarioEmail(email);
        return turnoRepository.findByMedicoIdOrderByFechaHoraAsc(medico.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TurnoResponse reservar(TurnoRequest request, String pacienteEmail) {
        Paciente paciente = getPacienteByEmail(pacienteEmail);
        Medico medico = medicoService.getById(request.getMedicoId());

        if (request.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se pueden reservar turnos en fechas pasadas");
        }

        if (turnoRepository.existsTurnoActivoEnHorario(medico.getId(), request.getFechaHora())) {
            throw new BusinessRuleException("El médico ya tiene un turno activo en ese horario");
        }

        Turno turno = Turno.builder()
                .paciente(paciente)
                .medico(medico)
                .fechaHora(request.getFechaHora())
                .estado(EstadoTurno.PENDIENTE)
                .observaciones(request.getObservaciones())
                .build();

        turno = turnoRepository.save(turno);
        log.info("Turno reservado: id={}, paciente={}, medico={}", turno.getId(), pacienteEmail, medico.getId());
        return toResponse(turno);
    }

    @Transactional
    public TurnoResponse cancelar(Long id, String email, Rol rol) {
        Turno turno = getById(id);

        if (rol == Rol.PACIENTE) {
            Paciente paciente = getPacienteByEmail(email);
            if (!turno.getPaciente().getId().equals(paciente.getId())) {
                throw new AccessDeniedException("Solo puedes cancelar tus propios turnos");
            }
        }

        return cambiarEstado(turno, EstadoTurno.CANCELADO);
    }

    @Transactional
    public TurnoResponse confirmar(Long id, String medicoEmail) {
        Turno turno = getById(id);
        Medico medico = medicoService.getByUsuarioEmail(medicoEmail);

        if (!turno.getMedico().getId().equals(medico.getId())) {
            throw new AccessDeniedException("Solo puedes confirmar tus propios turnos");
        }

        return cambiarEstado(turno, EstadoTurno.CONFIRMADO);
    }

    @Transactional
    public TurnoResponse completar(Long id, String medicoEmail) {
        Turno turno = getById(id);
        Medico medico = medicoService.getByUsuarioEmail(medicoEmail);

        if (!turno.getMedico().getId().equals(medico.getId())) {
            throw new AccessDeniedException("Solo puedes completar tus propios turnos");
        }

        return cambiarEstado(turno, EstadoTurno.COMPLETADO);
    }

    private TurnoResponse cambiarEstado(Turno turno, EstadoTurno nuevoEstado) {
        if (!turno.getEstado().puedeTransicionarA(nuevoEstado)) {
            throw new BusinessRuleException(
                    "No se puede cambiar el estado de " + turno.getEstado() + " a " + nuevoEstado);
        }
        turno.setEstado(nuevoEstado);
        return toResponse(turnoRepository.save(turno));
    }

    private Turno getById(Long id) {
        return turnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno", id));
    }

    private Paciente getPacienteByEmail(String email) {
        return pacienteRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado para: " + email));
    }

    private TurnoResponse toResponse(Turno t) {
        return TurnoResponse.builder()
                .id(t.getId())
                .pacienteId(t.getPaciente().getId())
                .pacienteNombre(t.getPaciente().getUsuario().getNombre() + " " + t.getPaciente().getUsuario().getApellido())
                .medicoId(t.getMedico().getId())
                .medicoNombre("Dr. " + t.getMedico().getUsuario().getNombre() + " " + t.getMedico().getUsuario().getApellido())
                .especialidad(t.getMedico().getEspecialidad().getNombre())
                .fechaHora(t.getFechaHora())
                .estado(t.getEstado())
                .observaciones(t.getObservaciones())
                .build();
    }
}
