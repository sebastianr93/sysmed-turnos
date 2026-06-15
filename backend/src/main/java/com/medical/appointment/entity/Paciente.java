package com.medical.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(length = 20)
    private String telefono;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "obra_social", length = 100)
    private String obraSocial;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Turno> turnos = new ArrayList<>();
}
