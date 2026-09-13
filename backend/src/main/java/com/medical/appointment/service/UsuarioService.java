package com.medical.appointment.service;

import com.medical.appointment.dto.request.ActualizarPerfilRequest;
import com.medical.appointment.dto.request.CambiarPasswordRequest;
import com.medical.appointment.dto.response.UsuarioResponse;
import com.medical.appointment.entity.Usuario;
import com.medical.appointment.exception.BusinessRuleException;
import com.medical.appointment.exception.ResourceNotFoundException;
import com.medical.appointment.repository.PacienteRepository;
import com.medical.appointment.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UsuarioResponse getPerfil(String email) {
        return toResponse(getByEmail(email));
    }

    @Transactional
    public UsuarioResponse actualizarPerfil(String email, ActualizarPerfilRequest request) {
        Usuario usuario = getByEmail(email);

        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());

        pacienteRepository.findByUsuarioEmail(email).ifPresent(paciente -> {
            paciente.setTelefono(request.getTelefono());
            paciente.setFechaNacimiento(request.getFechaNacimiento());
            paciente.setObraSocial(request.getObraSocial());
            pacienteRepository.save(paciente);
        });

        usuario = usuarioRepository.save(usuario);
        log.info("Perfil actualizado: {}", email);
        return toResponse(usuario);
    }

    @Transactional
    public void cambiarPassword(String email, CambiarPasswordRequest request) {
        Usuario usuario = getByEmail(email);

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
            throw new BusinessRuleException("La contraseña actual es incorrecta");
        }

        if (!request.getPasswordNueva().equals(request.getPasswordConfirmacion())) {
            throw new BusinessRuleException("La nueva contraseña y la confirmación no coinciden");
        }

        if (passwordEncoder.matches(request.getPasswordNueva(), usuario.getPassword())) {
            throw new BusinessRuleException("La nueva contraseña debe ser diferente a la actual");
        }

        usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
        usuarioRepository.save(usuario);
        log.info("Contraseña cambiada: {}", email);
    }

    private Usuario getByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));
    }

    private UsuarioResponse toResponse(Usuario u) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .email(u.getEmail())
                .rol(u.getRol())
                .fechaCreacion(u.getFechaCreacion())
                .activo(u.getActivo())
                .build();
    }
}
