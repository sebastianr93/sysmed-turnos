package com.medical.appointment.repository;

import com.medical.appointment.entity.Turno;
import com.medical.appointment.enums.EstadoTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    List<Turno> findByPacienteIdOrderByFechaHoraDesc(Long pacienteId);

    List<Turno> findByMedicoIdOrderByFechaHoraAsc(Long medicoId);

    List<Turno> findByMedicoIdAndEstadoOrderByFechaHoraAsc(Long medicoId, EstadoTurno estado);

    @Query("""
            SELECT COUNT(t) > 0 FROM Turno t
            WHERE t.medico.id = :medicoId
            AND t.fechaHora = :fechaHora
            AND t.estado NOT IN ('CANCELADO')
            """)
    boolean existsTurnoActivoEnHorario(
            @Param("medicoId") Long medicoId,
            @Param("fechaHora") LocalDateTime fechaHora);
}
