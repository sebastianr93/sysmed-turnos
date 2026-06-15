-- =============================================
-- Medical Appointment System - Seed Data
-- Password for all users: Admin1234!
-- BCrypt hash of "Admin1234!"
-- =============================================

-- Admin user
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Admin', 'Sistema', 'admin@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'ADMIN', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

-- Especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Clínica Médica',  'Medicina interna y diagnóstico general'),
  ('Cardiología',     'Diagnóstico y tratamiento de enfermedades del corazón'),
  ('Pediatría',       'Atención médica de niños y adolescentes'),
  ('Dermatología',    'Enfermedades de la piel, cabello y uñas'),
  ('Traumatología',   'Lesiones y enfermedades del sistema músculo-esquelético'),
  ('Ginecología',     'Salud del sistema reproductivo femenino'),
  ('Neurología',      'Enfermedades del sistema nervioso')
ON CONFLICT (nombre) DO NOTHING;

-- Médico 1 - Cardiología
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Carlos', 'Mendez', 'carlos.mendez@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-12345',
       (SELECT id FROM especialidades WHERE nombre = 'Cardiología'),
       'Cardiólogo con 15 años de experiencia en diagnóstico y tratamiento de enfermedades cardiovasculares.',
       TRUE
FROM usuarios u WHERE u.email = 'carlos.mendez@medical.com'
ON CONFLICT (matricula) DO NOTHING;

-- Médico 2 - Pediatría
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Ana', 'García', 'ana.garcia@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-67890',
       (SELECT id FROM especialidades WHERE nombre = 'Pediatría'),
       'Pediatra especializada en atención neonatal y desarrollo infantil.',
       TRUE
FROM usuarios u WHERE u.email = 'ana.garcia@medical.com'
ON CONFLICT (matricula) DO NOTHING;

-- Médico 3 - Clínica Médica
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Roberto', 'López', 'roberto.lopez@medical.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'MEDICO', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO medicos (usuario_id, matricula, especialidad_id, biografia, activo)
SELECT u.id, 'MN-11111',
       (SELECT id FROM especialidades WHERE nombre = 'Clínica Médica'),
       'Médico clínico con amplia experiencia en diagnóstico general y medicina preventiva.',
       TRUE
FROM usuarios u WHERE u.email = 'roberto.lopez@medical.com'
ON CONFLICT (matricula) DO NOTHING;

-- Paciente de prueba
INSERT INTO usuarios (nombre, apellido, email, password, rol, fecha_creacion, activo)
VALUES ('Juan', 'Pérez', 'juan.perez@email.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'PACIENTE', NOW(), TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (usuario_id, telefono, fecha_nacimiento, obra_social)
SELECT u.id, '011-4444-5555', '1990-05-15', 'OSDE'
FROM usuarios u WHERE u.email = 'juan.perez@email.com'
ON CONFLICT (usuario_id) DO NOTHING;
