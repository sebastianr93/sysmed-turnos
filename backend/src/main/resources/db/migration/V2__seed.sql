-- Medical Appointment System
-- Flyway Migration V2 — Seed Data
-- All passwords are BCrypt of "Admin1234!"

-- ── Admin ───────────────────────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Admin', 'Sistema', 'admin@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'ADMIN', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── Especialidades ──────────────────────────────────────────────────────────────
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Clínica Médica',  'Medicina interna, diagnóstico y tratamiento general'),
  ('Cardiología',     'Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio'),
  ('Pediatría',       'Atención médica integral de niños y adolescentes hasta 18 años'),
  ('Dermatología',    'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas'),
  ('Traumatología',   'Lesiones y enfermedades del sistema músculo-esquelético'),
  ('Ginecología',     'Salud reproductiva y atención integral de la mujer'),
  ('Neurología',      'Diagnóstico y tratamiento de enfermedades del sistema nervioso')
ON CONFLICT (nombre) DO NOTHING;

-- ── Médico 1 – Cardiología ──────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Carlos', 'Mendez', 'carlos.mendez@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-12345',
       (SELECT id FROM especialidades WHERE nombre = 'Cardiología'),
       'Cardiólogo con 15 años de experiencia. Especializado en diagnóstico por imagen, arritmias y prevención cardiovascular. Formado en el Hospital Italiano de Buenos Aires.',
       TRUE
FROM usuarios u WHERE u.email = 'carlos.mendez@medical.com'
ON CONFLICT (matricula) DO NOTHING;

-- Disponibilidades Médico 1
INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 1, '09:00', '13:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'carlos.mendez@medical.com'
ON CONFLICT DO NOTHING;

INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 3, '14:00', '18:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'carlos.mendez@medical.com'
ON CONFLICT DO NOTHING;

INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 7, '08:00', '12:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'carlos.mendez@medical.com'
ON CONFLICT DO NOTHING;

-- ── Médico 2 – Pediatría ────────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Ana', 'García', 'ana.garcia@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-67890',
       (SELECT id FROM especialidades WHERE nombre = 'Pediatría'),
       'Pediatra con más de 10 años de experiencia en atención neonatal, desarrollo infantil y pediatría del adolescente. Miembro de la Sociedad Argentina de Pediatría.',
       TRUE
FROM usuarios u WHERE u.email = 'ana.garcia@medical.com'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 2, '10:00', '14:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'ana.garcia@medical.com'
ON CONFLICT DO NOTHING;

INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 5, '15:00', '19:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'ana.garcia@medical.com'
ON CONFLICT DO NOTHING;

-- ── Médico 3 – Clínica Médica ───────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Roberto', 'López', 'roberto.lopez@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-11111',
       (SELECT id FROM especialidades WHERE nombre = 'Clínica Médica'),
       'Médico clínico con amplia trayectoria en diagnóstico general, medicina preventiva y seguimiento de enfermedades crónicas. Docente universitario.',
       TRUE
FROM usuarios u WHERE u.email = 'roberto.lopez@medical.com'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 1, '14:00', '18:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'roberto.lopez@medical.com'
ON CONFLICT DO NOTHING;

-- ── Médico 4 – Dermatología ─────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Laura', 'Fernández', 'laura.fernandez@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-22222',
       (SELECT id FROM especialidades WHERE nombre = 'Dermatología'),
       'Dermatóloga especializada en dermatología clínica y cosmética. Experta en el tratamiento de acné, psoriasis y melanoma. Certificada por la Sociedad Argentina de Dermatología.',
       TRUE
FROM usuarios u WHERE u.email = 'laura.fernandez@medical.com'
ON CONFLICT (matricula) DO NOTHING;

INSERT INTO disponibilidades (medico_id, fecha, hora_inicio, hora_fin)
SELECT m.id, CURRENT_DATE + 4, '09:00', '13:00'
FROM medicos m JOIN usuarios u ON m.usuario_id = u.id
WHERE u.email = 'laura.fernandez@medical.com'
ON CONFLICT DO NOTHING;

-- ── Paciente de prueba ──────────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Juan', 'Pérez', 'juan.perez@email.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'PACIENTE', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (usuario_id, telefono, fecha_nacimiento, obra_social)
SELECT u.id, '011-4444-5555', '1990-05-15', 'OSDE'
FROM usuarios u WHERE u.email = 'juan.perez@email.com'
ON CONFLICT (usuario_id) DO NOTHING;

-- ── Paciente 2 ──────────────────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('María', 'González', 'maria.gonzalez@email.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'PACIENTE', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (usuario_id, telefono, fecha_nacimiento, obra_social)
SELECT u.id, '011-5555-6666', '1985-08-20', 'Swiss Medical'
FROM usuarios u WHERE u.email = 'maria.gonzalez@email.com'
ON CONFLICT (usuario_id) DO NOTHING;
