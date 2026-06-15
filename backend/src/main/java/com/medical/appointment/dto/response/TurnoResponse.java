package com.medical.appointment.dto.response;

import com.medical.appointment.enums.EstadoTurno;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TurnoResponse {
    private Long id;
    private Long pacienteId;
    private String pacienteNombre;
    private Long medicoId;
    private String medicoNombre;
    private String especialidad;
    private LocalDateTime fechaHora;
    private EstadoTurno estado;
    private String observaciones;
}
