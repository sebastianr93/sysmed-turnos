package com.medical.appointment.config;

import com.medical.appointment.entity.*;
import com.medical.appointment.enums.EstadoTurno;
import com.medical.appointment.enums.Rol;
import com.medical.appointment.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DataInitializer – only runs on "dev" profile or when DB is empty.
 * For production, use Flyway migrations in db/migration/.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UsuarioRepository usuarioRepo;
    private final EspecialidadRepository especialidadRepo;
    private final MedicoRepository medicoRepo;
    private final PacienteRepository pacienteRepo;
    private final DisponibilidadRepository disponibilidadRepo;
    private final TurnoRepository turnoRepo;
    private final PasswordEncoder encoder;

    @Bean
    @Profile("dev")
    CommandLineRunner initDevData() {
        return args -> {
            if (usuarioRepo.count() > 0) {
                log.info("Database already seeded — skipping DataInitializer");
                return;
            }
            log.info("Seeding development data...");
            seed();
            log.info("Development data seeded successfully ✅");
        };
    }

    private void seed() {
        // Especialidades
        Especialidad cardio = especialidadRepo.save(Especialidad.builder().nombre("Cardiología").descripcion("Enfermedades del corazón").build());
        Especialidad pediatria = especialidadRepo.save(Especialidad.builder().nombre("Pediatría").descripcion("Atención pediátrica").build());
        Especialidad clinica = especialidadRepo.save(Especialidad.builder().nombre("Clínica Médica").descripcion("Medicina general").build());
        Especialidad dermato = especialidadRepo.save(Especialidad.builder().nombre("Dermatología").descripcion("Enfermedades de la piel").build());

        // Admin
        usuarioRepo.save(Usuario.builder()
                .nombre("Admin").apellido("Sistema").email("admin@medical.com")
                .password(encoder.encode("Admin1234!")).rol(Rol.ADMIN).activo(true).build());

        // Médico 1
        Usuario uMedico1 = usuarioRepo.save(Usuario.builder()
                .nombre("Carlos").apellido("Mendez").email("carlos.mendez@medical.com")
                .password(encoder.encode("Admin1234!")).rol(Rol.MEDICO).activo(true).build());
        Medico medico1 = medicoRepo.save(Medico.builder()
                .usuario(uMedico1).matricula("MN-12345").especialidad(cardio)
                .biografia("Cardiólogo con 15 años de experiencia.").activo(true).build());

        // Médico 2
        Usuario uMedico2 = usuarioRepo.save(Usuario.builder()
                .nombre("Ana").apellido("García").email("ana.garcia@medical.com")
                .password(encoder.encode("Admin1234!")).rol(Rol.MEDICO).activo(true).build());
        Medico medico2 = medicoRepo.save(Medico.builder()
                .usuario(uMedico2).matricula("MN-67890").especialidad(pediatria)
                .biografia("Pediatra especialista en desarrollo infantil.").activo(true).build());

        // Disponibilidades
        disponibilidadRepo.save(Disponibilidad.builder().medico(medico1)
                .fecha(LocalDate.now().plusDays(1)).horaInicio(LocalTime.of(9,0)).horaFin(LocalTime.of(13,0)).build());
        disponibilidadRepo.save(Disponibilidad.builder().medico(medico1)
                .fecha(LocalDate.now().plusDays(3)).horaInicio(LocalTime.of(14,0)).horaFin(LocalTime.of(18,0)).build());
        disponibilidadRepo.save(Disponibilidad.builder().medico(medico2)
                .fecha(LocalDate.now().plusDays(2)).horaInicio(LocalTime.of(10,0)).horaFin(LocalTime.of(14,0)).build());

        // Paciente
        Usuario uPaciente = usuarioRepo.save(Usuario.builder()
                .nombre("Juan").apellido("Pérez").email("juan.perez@email.com")
                .password(encoder.encode("Admin1234!")).rol(Rol.PACIENTE).activo(true).build());
        Paciente paciente = pacienteRepo.save(Paciente.builder()
                .usuario(uPaciente).telefono("011-4444-5555")
                .fechaNacimiento(LocalDate.of(1990, 5, 15)).obraSocial("OSDE").build());

        // Sample turno
        turnoRepo.save(Turno.builder()
                .paciente(paciente).medico(medico1)
                .fechaHora(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .estado(EstadoTurno.PENDIENTE)
                .observaciones("Control anual de rutina").build());
    }
}
