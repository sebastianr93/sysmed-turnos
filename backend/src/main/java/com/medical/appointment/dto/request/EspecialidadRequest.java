package com.medical.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EspecialidadRequest {

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 100)
    private String nombre;

    @Size(max = 500)
    private String descripcion;
}
