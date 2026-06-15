package com.medical.appointment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class DisponibilidadResponse {
    private Long id;
    private Long medicoId;
    private String medicoNombre;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
