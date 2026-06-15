package com.medical.appointment.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MedicoRequest {

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
    @Size(min = 6)
    private String password;

    @NotBlank(message = "La matrícula es requerida")
    @Size(max = 20)
    private String matricula;

    @NotNull(message = "La especialidad es requerida")
    private Long especialidadId;

    @Size(max = 1000)
    private String biografia;
}
