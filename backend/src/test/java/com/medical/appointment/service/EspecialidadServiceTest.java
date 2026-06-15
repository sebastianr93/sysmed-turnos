package com.medical.appointment.service;

import com.medical.appointment.dto.request.EspecialidadRequest;
import com.medical.appointment.dto.response.EspecialidadResponse;
import com.medical.appointment.entity.Especialidad;
import com.medical.appointment.exception.DuplicateResourceException;
import com.medical.appointment.exception.ResourceNotFoundException;
import com.medical.appointment.repository.EspecialidadRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EspecialidadService - Tests")
class EspecialidadServiceTest {

    @Mock private EspecialidadRepository especialidadRepository;

    @InjectMocks private EspecialidadService especialidadService;

    @Test
    @DisplayName("Debe retornar todas las especialidades")
    void debeRetornarTodasLasEspecialidades() {
        List<Especialidad> lista = List.of(
                Especialidad.builder().id(1L).nombre("Cardiología").descripcion("Corazón").build(),
                Especialidad.builder().id(2L).nombre("Pediatría").descripcion("Niños").build()
        );
        when(especialidadRepository.findAll()).thenReturn(lista);

        List<EspecialidadResponse> resultado = especialidadService.findAll();

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getNombre()).isEqualTo("Cardiología");
        assertThat(resultado.get(1).getNombre()).isEqualTo("Pediatría");
    }

    @Test
    @DisplayName("Debe crear especialidad correctamente")
    void debeCrearEspecialidadCorrectamente() {
        EspecialidadRequest request = new EspecialidadRequest();
        request.setNombre("Neurología");
        request.setDescripcion("Sistema nervioso");

        Especialidad saved = Especialidad.builder().id(1L)
                .nombre("Neurología").descripcion("Sistema nervioso").build();

        when(especialidadRepository.existsByNombreIgnoreCase("Neurología")).thenReturn(false);
        when(especialidadRepository.save(any())).thenReturn(saved);

        EspecialidadResponse response = especialidadService.create(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNombre()).isEqualTo("Neurología");
    }

    @Test
    @DisplayName("Debe lanzar excepción al crear especialidad duplicada")
    void debeLanzarExcepcionEspecialidadDuplicada() {
        EspecialidadRequest request = new EspecialidadRequest();
        request.setNombre("Cardiología");

        when(especialidadRepository.existsByNombreIgnoreCase("Cardiología")).thenReturn(true);

        assertThatThrownBy(() -> especialidadService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Cardiología");

        verify(especialidadRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción al buscar especialidad inexistente")
    void debeLanzarExcepcionEspecialidadNoEncontrada() {
        when(especialidadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> especialidadService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
