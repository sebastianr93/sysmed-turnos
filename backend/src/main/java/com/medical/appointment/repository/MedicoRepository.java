package com.medical.appointment.repository;

import com.medical.appointment.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    List<Medico> findByActivoTrue();

    List<Medico> findByEspecialidadIdAndActivoTrue(Long especialidadId);

    Optional<Medico> findByMatricula(String matricula);

    boolean existsByMatricula(String matricula);

    Optional<Medico> findByUsuarioId(Long usuarioId);

    @Query("SELECT m FROM Medico m JOIN FETCH m.usuario JOIN FETCH m.especialidad WHERE m.activo = true")
    List<Medico> findAllActivosWithDetails();
}
