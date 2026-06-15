package com.medical.appointment.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El apellido es requerido")
    @Size(max = 100)
    private String apellido;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @Size(max = 20)
    private String telefono;

    @Past(message = "La fecha de nacimiento debe ser pasada")
    private LocalDate fechaNacimiento;

    @Size(max = 100)
    private String obraSocial;
}
