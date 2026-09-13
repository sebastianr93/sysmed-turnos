package com.medical.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CambiarPasswordRequest {

    @NotBlank(message = "La contraseña actual es requerida")
    private String passwordActual;

    @NotBlank(message = "La nueva contraseña es requerida")
    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    private String passwordNueva;

    @NotBlank(message = "La confirmación es requerida")
    private String passwordConfirmacion;
}
