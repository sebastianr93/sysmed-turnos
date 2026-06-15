package com.medical.appointment.service;

import com.medical.appointment.dto.request.MedicoRequest;
import com.medical.appointment.dto.response.EspecialidadResponse;
import com.medical.appointment.dto.response.MedicoResponse;
import com.medical.appointment.entity.Especialidad;
import com.medical.appointment.entity.Medico;
import com.medical.appointment.entity.Usuario;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.exception.DuplicateResourceException;
import com.medical.appointment.exception.ResourceNotFoundException;
import com.medical.appointment.repository.MedicoRepository;
import com.medical.appointment.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EspecialidadService especialidadService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<MedicoResponse> findAll() {
        return medicoRepository.findAllActivosWithDetails().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicoResponse findById(Long id) {
        return toResponse(getById(id));
    }

    @Transactional(readOnly = true)
    public List<MedicoResponse> findByEspecialidad(Long especialidadId) {
        return medicoRepository.findByEspecialidadIdAndActivoTrue(especialidadId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MedicoResponse create(MedicoRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Ya existe un usuario con el email: " + request.getEmail());
        }
        if (medicoRepository.existsByMatricula(request.getMatricula())) {
            throw new DuplicateResourceException("Ya existe un médico con la matrícula: " + request.getMatricula());
        }

        Especialidad especialidad = especialidadService.getById(request.getEspecialidadId());

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Rol.MEDICO)
                .activo(true)
                .build();
        usuario = usuarioRepository.save(usuario);

        Medico medico = Medico.builder()
                .usuario(usuario)
                .matricula(request.getMatricula())
                .especialidad(especialidad)
                .biografia(request.getBiografia())
                .activo(true)
                .build();

        medico = medicoRepository.save(medico);
        log.info("Doctor created: {} - Matricula: {}", usuario.getEmail(), medico.getMatricula());
        return toResponse(medico);
    }

    @Transactional
    public MedicoResponse update(Long id, MedicoRequest request) {
        Medico medico = getById(id);
        Especialidad especialidad = especialidadService.getById(request.getEspecialidadId());

        medico.getUsuario().setNombre(request.getNombre());
        medico.getUsuario().setApellido(request.getApellido());
        medico.setEspecialidad(especialidad);
        medico.setBiografia(request.getBiografia());

        return toResponse(medicoRepository.save(medico));
    }

    @Transactional
    public void delete(Long id) {
        Medico medico = getById(id);
        medico.setActivo(false);
        medico.getUsuario().setActivo(false);
        medicoRepository.save(medico);
        log.info("Doctor deactivated: {}", id);
    }

    public Medico getById(Long id) {
        return medicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico", id));
    }

    public Medico getByUsuarioEmail(String email) {
        return medicoRepository.findByUsuarioId(
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"))
                        .getId())
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado para el usuario"));
    }

    public MedicoResponse toResponse(Medico m) {
        return MedicoResponse.builder()
                .id(m.getId())
                .usuarioId(m.getUsuario().getId())
                .nombre(m.getUsuario().getNombre())
                .apellido(m.getUsuario().getApellido())
                .email(m.getUsuario().getEmail())
                .matricula(m.getMatricula())
                .especialidad(EspecialidadResponse.builder()
                        .id(m.getEspecialidad().getId())
                        .nombre(m.getEspecialidad().getNombre())
                        .descripcion(m.getEspecialidad().getDescripcion())
                        .build())
                .biografia(m.getBiografia())
                .activo(m.getActivo())
                .build();
    }
}
