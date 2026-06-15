package com.medical.appointment.repository;

import com.medical.appointment.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByUsuarioId(Long usuarioId);
    Optional<Paciente> findByUsuarioEmail(String email);
}
