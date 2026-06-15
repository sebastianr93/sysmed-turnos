package com.medical.appointment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PacienteResponse {
    private Long id;
    private Long usuarioId;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String obraSocial;
}
