package com.medical.appointment.repository;

import com.medical.appointment.entity.Disponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {

    List<Disponibilidad> findByMedicoIdAndFechaGreaterThanEqualOrderByFechaAscHoraInicioAsc(
            Long medicoId, LocalDate fecha);

    @Query("""
            SELECT COUNT(d) > 0 FROM Disponibilidad d
            WHERE d.medico.id = :medicoId
            AND d.fecha = :fecha
            AND (
                (d.horaInicio <= :horaInicio AND d.horaFin > :horaInicio)
                OR (d.horaInicio < :horaFin AND d.horaFin >= :horaFin)
                OR (d.horaInicio >= :horaInicio AND d.horaFin <= :horaFin)
            )
            AND (:excludeId IS NULL OR d.id <> :excludeId)
            """)
    boolean existsSolapamiento(
            @Param("medicoId") Long medicoId,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin,
            @Param("excludeId") Long excludeId);
}
