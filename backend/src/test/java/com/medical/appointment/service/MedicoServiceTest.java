package com.medical.appointment.service;

import com.medical.appointment.dto.request.MedicoRequest;
import com.medical.appointment.dto.response.MedicoResponse;
import com.medical.appointment.entity.Especialidad;
import com.medical.appointment.entity.Medico;
import com.medical.appointment.entity.Usuario;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.exception.DuplicateResourceException;
import com.medical.appointment.repository.MedicoRepository;
import com.medical.appointment.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MedicoService - Tests")
class MedicoServiceTest {

    @Mock private MedicoRepository medicoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EspecialidadService especialidadService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private MedicoService medicoService;

    private Especialidad especialidad;
    private Usuario usuario;
    private Medico medico;

    @BeforeEach
    void setUp() {
        especialidad = Especialidad.builder().id(1L).nombre("Cardiología").descripcion("Corazón").build();

        usuario = Usuario.builder()
                .id(1L).nombre("Carlos").apellido("Mendez")
                .email("carlos@test.com").rol(Rol.MEDICO).activo(true).build();

        medico = Medico.builder()
                .id(1L).usuario(usuario).matricula("MN-001")
                .especialidad(especialidad).activo(true).build();
    }

    @Nested
    @DisplayName("findAll()")
    class FindAllTests {

        @Test
        @DisplayName("Debe retornar lista de médicos activos")
        void debeRetornarMedicosActivos() {
            when(medicoRepository.findAllActivosWithDetails()).thenReturn(List.of(medico));

            List<MedicoResponse> resultado = medicoService.findAll();

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getMatricula()).isEqualTo("MN-001");
            assertThat(resultado.get(0).getNombre()).isEqualTo("Carlos");
        }
    }

    @Nested
    @DisplayName("create()")
    class CreateTests {

        @Test
        @DisplayName("Debe crear médico correctamente")
        void debeCrearMedicoCorrectamente() {
            MedicoRequest request = new MedicoRequest();
            request.setNombre("Laura");
            request.setApellido("García");
            request.setEmail("laura@test.com");
            request.setPassword("Pass1234!");
            request.setMatricula("MN-999");
            request.setEspecialidadId(1L);
            request.setBiografia("Médica con experiencia.");

            Usuario savedUser = Usuario.builder().id(2L).nombre("Laura").apellido("García")
                    .email("laura@test.com").rol(Rol.MEDICO).activo(true).build();
            Medico savedMedico = Medico.builder().id(2L).usuario(savedUser)
                    .matricula("MN-999").especialidad(especialidad).activo(true).build();

            when(usuarioRepository.existsByEmail("laura@test.com")).thenReturn(false);
            when(medicoRepository.existsByMatricula("MN-999")).thenReturn(false);
            when(especialidadService.getById(1L)).thenReturn(especialidad);
            when(passwordEncoder.encode(any())).thenReturn("hashed");
            when(usuarioRepository.save(any())).thenReturn(savedUser);
            when(medicoRepository.save(any())).thenReturn(savedMedico);

            MedicoResponse response = medicoService.create(request);

            assertThat(response.getMatricula()).isEqualTo("MN-999");
            verify(medicoRepository, times(1)).save(any(Medico.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si el email ya existe")
        void debeLanzarExcepcionEmailDuplicado() {
            MedicoRequest request = new MedicoRequest();
            request.setEmail("carlos@test.com");
            request.setMatricula("MN-NEW");

            when(usuarioRepository.existsByEmail("carlos@test.com")).thenReturn(true);

            assertThatThrownBy(() -> medicoService.create(request))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("carlos@test.com");

            verify(medicoRepository, never()).save(any());
        }

        @Test
        @DisplayName("Debe lanzar excepción si la matrícula ya existe")
        void debeLanzarExcepcionMatriculaDuplicada() {
            MedicoRequest request = new MedicoRequest();
            request.setEmail("nuevo@test.com");
            request.setMatricula("MN-001");

            when(usuarioRepository.existsByEmail("nuevo@test.com")).thenReturn(false);
            when(medicoRepository.existsByMatricula("MN-001")).thenReturn(true);

            assertThatThrownBy(() -> medicoService.create(request))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("MN-001");
        }
    }

    @Nested
    @DisplayName("delete() – soft delete")
    class DeleteTests {

        @Test
        @DisplayName("Debe desactivar médico (soft delete)")
        void debeDesactivarMedico() {
            when(medicoRepository.findById(1L)).thenReturn(Optional.of(medico));
            when(medicoRepository.save(any())).thenReturn(medico);

            medicoService.delete(1L);

            assertThat(medico.getActivo()).isFalse();
            assertThat(medico.getUsuario().getActivo()).isFalse();
            verify(medicoRepository, times(1)).save(medico);
        }
    }
}
