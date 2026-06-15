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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Tests")
class AuthServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    @Test
    @DisplayName("Debe registrar paciente nuevo exitosamente")
    void debeRegistrarPacienteNuevo() {
        RegisterRequest request = new RegisterRequest();
        request.setNombre("María");
        request.setApellido("González");
        request.setEmail("maria@test.com");
        request.setPassword("Pass1234!");
        request.setTelefono("011-1234-5678");
        request.setFechaNacimiento(LocalDate.of(1992, 3, 15));
        request.setObraSocial("Swiss Medical");

        Usuario savedUser = Usuario.builder()
                .id(1L).nombre("María").apellido("González")
                .email("maria@test.com").rol(Rol.PACIENTE).activo(true).build();

        when(usuarioRepository.existsByEmail("maria@test.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(usuarioRepository.save(any())).thenReturn(savedUser);
        when(pacienteRepository.save(any())).thenReturn(Paciente.builder().id(1L).usuario(savedUser).build());
        when(jwtService.generateToken(any())).thenReturn("jwt_token_mock");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("maria@test.com");
        assertThat(response.getRol()).isEqualTo(Rol.PACIENTE);
        assertThat(response.getToken()).isEqualTo("jwt_token_mock");
        verify(pacienteRepository, times(1)).save(any(Paciente.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al registrar email duplicado")
    void debeLanzarExcepcionEmailDuplicado() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existente@test.com");
        request.setNombre("Test");
        request.setApellido("User");
        request.setPassword("Pass1234!");

        when(usuarioRepository.existsByEmail("existente@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("existente@test.com");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe hacer login exitosamente con credenciales válidas")
    void debeHacerLoginExitosamente() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@medical.com");
        request.setPassword("Admin1234!");

        Usuario usuario = Usuario.builder()
                .id(1L).nombre("Admin").apellido("Sistema")
                .email("admin@medical.com").rol(Rol.ADMIN).activo(true).build();

        when(usuarioRepository.findByEmail("admin@medical.com")).thenReturn(Optional.of(usuario));
        when(jwtService.generateToken(any())).thenReturn("admin_jwt_token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("admin_jwt_token");
        assertThat(response.getRol()).isEqualTo(Rol.ADMIN);
        verify(authenticationManager, times(1)).authenticate(any());
    }
}
