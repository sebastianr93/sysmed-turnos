package com.medical.appointment.service;

import com.medical.appointment.dto.request.TurnoRequest;
import com.medical.appointment.dto.response.TurnoResponse;
import com.medical.appointment.entity.*;
import com.medical.appointment.enums.EstadoTurno;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.exception.BusinessRuleException;
import com.medical.appointment.repository.PacienteRepository;
import com.medical.appointment.repository.TurnoRepository;
import com.medical.appointment.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TurnoService - Tests")
class TurnoServiceTest {

    @Mock private TurnoRepository turnoRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private MedicoService medicoService;
    @Mock private UsuarioRepository usuarioRepository;

    @InjectMocks private TurnoService turnoService;

    private Usuario usuarioPaciente;
    private Usuario usuarioMedico;
    private Paciente paciente;
    private Medico medico;
    private Especialidad especialidad;

    @BeforeEach
    void setUp() {
        especialidad = Especialidad.builder().id(1L).nombre("Cardiología").build();

        usuarioPaciente = Usuario.builder()
                .id(1L).nombre("Juan").apellido("Pérez")
                .email("juan@test.com").rol(Rol.PACIENTE).activo(true).build();

        usuarioMedico = Usuario.builder()
                .id(2L).nombre("Carlos").apellido("Mendez")
                .email("carlos@test.com").rol(Rol.MEDICO).activo(true).build();

        paciente = Paciente.builder().id(1L).usuario(usuarioPaciente).build();

        medico = Medico.builder()
                .id(1L).usuario(usuarioMedico)
                .matricula("MN-001").especialidad(especialidad).activo(true).build();
    }

    @Nested
    @DisplayName("reservar()")
    class ReservarTests {

        @Test
        @DisplayName("Debe reservar turno exitosamente cuando no hay conflictos")
        void debeReservarTurnoExitosamente() {
            TurnoRequest request = new TurnoRequest();
            request.setMedicoId(1L);
            request.setFechaHora(LocalDateTime.now().plusDays(3));
            request.setObservaciones("Control rutinario");

            Turno turnoGuardado = Turno.builder()
                    .id(1L).paciente(paciente).medico(medico)
                    .fechaHora(request.getFechaHora())
                    .estado(EstadoTurno.PENDIENTE)
                    .observaciones(request.getObservaciones())
                    .build();

            when(pacienteRepository.findByUsuarioEmail("juan@test.com")).thenReturn(Optional.of(paciente));
            when(medicoService.getById(1L)).thenReturn(medico);
            when(turnoRepository.existsTurnoActivoEnHorario(anyLong(), any())).thenReturn(false);
            when(turnoRepository.save(any(Turno.class))).thenReturn(turnoGuardado);

            TurnoResponse response = turnoService.reservar(request, "juan@test.com");

            assertThat(response).isNotNull();
            assertThat(response.getEstado()).isEqualTo(EstadoTurno.PENDIENTE);
            assertThat(response.getMedicoId()).isEqualTo(1L);
            verify(turnoRepository, times(1)).save(any(Turno.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando el horario ya está ocupado")
        void debeLanzarExcepcionHorarioOcupado() {
            TurnoRequest request = new TurnoRequest();
            request.setMedicoId(1L);
            request.setFechaHora(LocalDateTime.now().plusDays(1));

            when(pacienteRepository.findByUsuarioEmail("juan@test.com")).thenReturn(Optional.of(paciente));
            when(medicoService.getById(1L)).thenReturn(medico);
            when(turnoRepository.existsTurnoActivoEnHorario(anyLong(), any())).thenReturn(true);

            assertThatThrownBy(() -> turnoService.reservar(request, "juan@test.com"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("ya tiene un turno activo");

            verify(turnoRepository, never()).save(any());
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando la fecha es pasada")
        void debeLanzarExcepcionFechaPasada() {
            TurnoRequest request = new TurnoRequest();
            request.setMedicoId(1L);
            request.setFechaHora(LocalDateTime.now().minusDays(1));

            when(pacienteRepository.findByUsuarioEmail("juan@test.com")).thenReturn(Optional.of(paciente));
            when(medicoService.getById(1L)).thenReturn(medico);

            assertThatThrownBy(() -> turnoService.reservar(request, "juan@test.com"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("fechas pasadas");
        }
    }

    @Nested
    @DisplayName("cancelar()")
    class CancelarTests {

        @Test
        @DisplayName("Paciente puede cancelar su propio turno PENDIENTE")
        void pacientePuedeCancelarSuTurno() {
            Turno turno = Turno.builder()
                    .id(1L).paciente(paciente).medico(medico)
                    .fechaHora(LocalDateTime.now().plusDays(2))
                    .estado(EstadoTurno.PENDIENTE).build();

            Turno cancelado = Turno.builder()
                    .id(1L).paciente(paciente).medico(medico)
                    .fechaHora(turno.getFechaHora())
                    .estado(EstadoTurno.CANCELADO).build();

            when(turnoRepository.findById(1L)).thenReturn(Optional.of(turno));
            when(pacienteRepository.findByUsuarioEmail("juan@test.com")).thenReturn(Optional.of(paciente));
            when(turnoRepository.save(any())).thenReturn(cancelado);

            TurnoResponse response = turnoService.cancelar(1L, "juan@test.com", Rol.PACIENTE);

            assertThat(response.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
        }

        @Test
        @DisplayName("Paciente NO puede cancelar turno de otro paciente")
        void pacienteNoPuedeCancelarTurnoAjeno() {
            Paciente otroPaciente = Paciente.builder().id(99L)
                    .usuario(Usuario.builder().id(99L).email("otro@test.com").build()).build();

            Turno turno = Turno.builder()
                    .id(1L).paciente(otroPaciente).medico(medico)
                    .estado(EstadoTurno.PENDIENTE).build();

            when(turnoRepository.findById(1L)).thenReturn(Optional.of(turno));
            when(pacienteRepository.findByUsuarioEmail("juan@test.com")).thenReturn(Optional.of(paciente));

            assertThatThrownBy(() -> turnoService.cancelar(1L, "juan@test.com", Rol.PACIENTE))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("No se puede cancelar un turno ya COMPLETADO")
        void noSePuedeCancelarTurnoCompletado() {
            Turno turno = Turno.builder()
                    .id(1L).paciente(paciente).medico(medico)
                    .estado(EstadoTurno.COMPLETADO).build();

            when(turnoRepository.findById(1L)).thenReturn(Optional.of(turno));
            when(pacienteRepository.findByUsuarioEmail("juan@test.com")).thenReturn(Optional.of(paciente));

            assertThatThrownBy(() -> turnoService.cancelar(1L, "juan@test.com", Rol.PACIENTE))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessageContaining("No se puede cambiar el estado");
        }

        @Test
        @DisplayName("ADMIN puede cancelar cualquier turno")
        void adminPuedeCancelarCualquierTurno() {
            Turno turno = Turno.builder()
                    .id(1L).paciente(paciente).medico(medico)
                    .estado(EstadoTurno.CONFIRMADO).build();

            Turno cancelado = Turno.builder()
                    .id(1L).paciente(paciente).medico(medico)
                    .estado(EstadoTurno.CANCELADO).build();

            when(turnoRepository.findById(1L)).thenReturn(Optional.of(turno));
            when(turnoRepository.save(any())).thenReturn(cancelado);

            TurnoResponse response = turnoService.cancelar(1L, "admin@medical.com", Rol.ADMIN);

            assertThat(response.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
        }
    }

    @Nested
    @DisplayName("Transiciones de estado")
    class TransicionEstadoTests {

        @Test
        @DisplayName("PENDIENTE -> CONFIRMADO es válida")
        void pendienteAConfirmadoEsValida() {
            assertThat(EstadoTurno.PENDIENTE.puedeTransicionarA(EstadoTurno.CONFIRMADO)).isTrue();
        }

        @Test
        @DisplayName("CONFIRMADO -> COMPLETADO es válida")
        void confirmadoACompletadoEsValida() {
            assertThat(EstadoTurno.CONFIRMADO.puedeTransicionarA(EstadoTurno.COMPLETADO)).isTrue();
        }

        @Test
        @DisplayName("COMPLETADO -> PENDIENTE NO es válida")
        void completadoAPendienteNoEsValida() {
            assertThat(EstadoTurno.COMPLETADO.puedeTransicionarA(EstadoTurno.PENDIENTE)).isFalse();
        }

        @Test
        @DisplayName("CANCELADO es estado final")
        void canceladoEsEstadoFinal() {
            assertThat(EstadoTurno.CANCELADO.puedeTransicionarA(EstadoTurno.PENDIENTE)).isFalse();
            assertThat(EstadoTurno.CANCELADO.puedeTransicionarA(EstadoTurno.CONFIRMADO)).isFalse();
            assertThat(EstadoTurno.CANCELADO.puedeTransicionarA(EstadoTurno.COMPLETADO)).isFalse();
        }
    }
}
