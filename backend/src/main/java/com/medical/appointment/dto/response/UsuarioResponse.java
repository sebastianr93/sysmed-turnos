package com.medical.appointment.dto.response;

import com.medical.appointment.enums.Rol;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private Rol rol;
    private LocalDateTime fechaCreacion;
    private Boolean activo;
}
