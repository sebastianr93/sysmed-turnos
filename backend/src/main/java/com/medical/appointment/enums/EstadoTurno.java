package com.medical.appointment.enums;

public enum EstadoTurno {
    PENDIENTE,
    CONFIRMADO,
    CANCELADO,
    COMPLETADO;

    public boolean puedeTransicionarA(EstadoTurno nuevoEstado) {
        return switch (this) {
            case PENDIENTE -> nuevoEstado == CONFIRMADO || nuevoEstado == CANCELADO;
            case CONFIRMADO -> nuevoEstado == COMPLETADO || nuevoEstado == CANCELADO;
            case CANCELADO, COMPLETADO -> false;
        };
    }
}
