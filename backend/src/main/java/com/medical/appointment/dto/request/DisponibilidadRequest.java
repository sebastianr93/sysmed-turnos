package com.medical.appointment.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DisponibilidadRequest {

    @NotNull(message = "El médico es requerido")
    private Long medicoId;

    @NotNull(message = "La fecha es requerida")
    @Future(message = "La fecha debe ser futura")
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es requerida")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es requerida")
    private LocalTime horaFin;
}
