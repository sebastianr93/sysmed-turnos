package com.medical.appointment.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicoResponse {
    private Long id;
    private Long usuarioId;
    private String nombre;
    private String apellido;
    private String email;
    private String matricula;
    private EspecialidadResponse especialidad;
    private String biografia;
    private Boolean activo;
}
