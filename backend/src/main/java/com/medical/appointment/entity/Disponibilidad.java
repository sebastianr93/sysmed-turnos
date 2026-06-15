package com.medical.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "disponibilidades",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"medico_id", "fecha", "hora_inicio"}
       ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disponibilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;
}
