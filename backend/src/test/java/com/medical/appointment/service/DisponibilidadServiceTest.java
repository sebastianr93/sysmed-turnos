package com.medical.appointment.service;

import com.medical.appointment.dto.request.DisponibilidadRequest;
import com.medical.appointment.dto.response.DisponibilidadResponse;
import com.medical.appointment.entity.Especialidad;
import com.medical.appointment.entity.Medico;
import com.medical.appointment.entity.Usuario;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.exception.BusinessRuleException;
import com.medical.appointment.repository.DisponibilidadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DisponibilidadService - Tests")
class DisponibilidadServiceTest {

    @Mock private DisponibilidadRepository disponibilidadRepository;
    @Mock private MedicoService medicoService;

    @InjectMocks private DisponibilidadService disponibilidadService;

    private Medico medico;

    @BeforeEach
    void setUp() {
        Usuario usuario = Usuario.builder()
                .id(1L).nombre("Carlos").apellido("Mendez")
                .email("carlos@test.com").rol(Rol.MEDICO).activo(true).build();
        Especialidad esp = Especialidad.builder().id(1L).nombre("Cardiología").build();
        medico = Medico.builder().id(1L).usuario(usuario).matricula("MN-001")
                .especialidad(esp).activo(true).build();
    }

    @Test
    @DisplayName("Debe rechazar hora de inicio >= hora de fin")
    void debeRechazarHoraInicioMayorOIgualAHoraFin() {
        DisponibilidadRequest request = new DisponibilidadRequest();
        request.setMedicoId(1L);
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHoraInicio(LocalTime.of(15, 0));
        request.setHoraFin(LocalTime.of(10, 0));   // invalid

        when(medicoService.getById(1L)).thenReturn(medico);

        assertThatThrownBy(() -> disponibilidadService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("hora de inicio");
    }

    @Test
    @DisplayName("Debe rechazar horarios superpuestos")
    void debeRechazarHorariosSolapados() {
        DisponibilidadRequest request = new DisponibilidadRequest();
        request.setMedicoId(1L);
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHoraInicio(LocalTime.of(9, 0));
        request.setHoraFin(LocalTime.of(13, 0));

        when(medicoService.getById(1L)).thenReturn(medico);
        when(disponibilidadRepository.existsSolapamiento(any(), any(), any(), any(), any()))
                .thenReturn(true);

        assertThatThrownBy(() -> disponibilidadService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("superpone");

        verify(disponibilidadRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe rechazar hora inicio igual a hora fin")
    void debeRechazarHoraInicioIgualAHoraFin() {
        DisponibilidadRequest request = new DisponibilidadRequest();
        request.setMedicoId(1L);
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHoraInicio(LocalTime.of(10, 0));
        request.setHoraFin(LocalTime.of(10, 0));  // same

        when(medicoService.getById(1L)).thenReturn(medico);

        assertThatThrownBy(() -> disponibilidadService.create(request))
                .isInstanceOf(BusinessRuleException.class);
    }
}
