-- Medical Appointment System
-- Flyway Migration V1 — Schema Creation

CREATE TABLE IF NOT EXISTS usuarios (
    id               BIGSERIAL    PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    rol              VARCHAR(20)  NOT NULL CHECK (rol IN ('ADMIN','MEDICO','PACIENTE')),
    fecha_creacion   TIMESTAMP    NOT NULL DEFAULT NOW(),
    activo           BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS especialidades (
    id          BIGSERIAL    PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS medicos (
    id              BIGSERIAL   PRIMARY KEY,
    usuario_id      BIGINT      NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    matricula       VARCHAR(20) NOT NULL UNIQUE,
    especialidad_id BIGINT      NOT NULL REFERENCES especialidades(id),
    biografia       VARCHAR(1000),
    activo          BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pacientes (
    id               BIGSERIAL   PRIMARY KEY,
    usuario_id       BIGINT      NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    telefono         VARCHAR(20),
    fecha_nacimiento DATE,
    obra_social      VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS disponibilidades (
    id          BIGSERIAL  PRIMARY KEY,
    medico_id   BIGINT     NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    fecha       DATE       NOT NULL,
    hora_inicio TIME       NOT NULL,
    hora_fin    TIME       NOT NULL,
    CONSTRAINT uq_disponibilidad UNIQUE (medico_id, fecha, hora_inicio),
    CONSTRAINT chk_horas CHECK (hora_inicio < hora_fin)
);

CREATE TABLE IF NOT EXISTS turnos (
    id            BIGSERIAL   PRIMARY KEY,
    paciente_id   BIGINT      NOT NULL REFERENCES pacientes(id),
    medico_id     BIGINT      NOT NULL REFERENCES medicos(id),
    fecha_hora    TIMESTAMP   NOT NULL,
    estado        VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                              CHECK (estado IN ('PENDIENTE','CONFIRMADO','CANCELADO','COMPLETADO')),
    observaciones VARCHAR(500)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_turnos_paciente    ON turnos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_turnos_medico      ON turnos(medico_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_hora  ON turnos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_turnos_estado      ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_disp_medico_fecha  ON disponibilidades(medico_id, fecha);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidad ON medicos(especialidad_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email     ON usuarios(email);
