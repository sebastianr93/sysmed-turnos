package com.medical.appointment.dto.response;

import com.medical.appointment.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tipo;
    private Long usuarioId;
    private String nombre;
    private String apellido;
    private String email;
    private Rol rol;
}
