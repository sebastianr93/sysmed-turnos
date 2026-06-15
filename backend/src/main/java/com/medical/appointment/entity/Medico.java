package com.medical.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, unique = true, length = 20)
    private String matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialidad_id", nullable = false)
    private Especialidad especialidad;

    @Column(length = 1000)
    private String biografia;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "medico", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Disponibilidad> disponibilidades = new ArrayList<>();

    @OneToMany(mappedBy = "medico", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Turno> turnos = new ArrayList<>();
}
