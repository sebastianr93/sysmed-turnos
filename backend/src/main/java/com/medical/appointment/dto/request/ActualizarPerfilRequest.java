package com.medical.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ActualizarPerfilRequest {

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El apellido es requerido")
    @Size(max = 100)
    private String apellido;

    @Size(max = 20)
    private String telefono;

    private LocalDate fechaNacimiento;

    @Size(max = 100)
    private String obraSocial;
}
