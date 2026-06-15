package com.medical.appointment.service;

import com.medical.appointment.dto.request.LoginRequest;
import com.medical.appointment.dto.request.RegisterRequest;
import com.medical.appointment.dto.response.AuthResponse;
import com.medical.appointment.entity.Paciente;
import com.medical.appointment.entity.Usuario;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.exception.DuplicateResourceException;
import com.medical.appointment.repository.PacienteRepository;
import com.medical.appointment.repository.UsuarioRepository;
import com.medical.appointment.security.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Ya existe una cuenta registrada con el email: " + request.getEmail());
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Rol.PACIENTE)
                .activo(true)
                .build();

        usuario = usuarioRepository.save(usuario);

        Paciente paciente = Paciente.builder()
                .usuario(usuario)
                .telefono(request.getTelefono())
                .fechaNacimiento(request.getFechaNacimiento())
                .obraSocial(request.getObraSocial())
                .build();

        pacienteRepository.save(paciente);

        log.info("New patient registered: {}", usuario.getEmail());

        String token = jwtService.generateToken(usuario);
        return buildAuthResponse(token, usuario);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtService.generateToken(usuario);
        log.info("User logged in: {}", usuario.getEmail());

        return buildAuthResponse(token, usuario);
    }

    private AuthResponse buildAuthResponse(String token, Usuario usuario) {
        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .usuarioId(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .build();
    }
}
