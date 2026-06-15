package com.medical.appointment.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TurnoRequest {

    @NotNull(message = "El médico es requerido")
    private Long medicoId;

    @NotNull(message = "La fecha y hora son requeridas")
    @Future(message = "La fecha del turno debe ser futura")
    private LocalDateTime fechaHora;

    @Size(max = 500)
    private String observaciones;
}
