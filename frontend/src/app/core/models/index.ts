// ─── Enums ─────────────────────────────────────────────────────────────────────
export enum Rol {
  ADMIN = 'ADMIN',
  MEDICO = 'MEDICO',
  PACIENTE = 'PACIENTE'
}

export enum EstadoTurno {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  COMPLETADO = 'COMPLETADO'
}

// ─── Auth ───────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  fechaNacimiento?: string;
  obraSocial?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
}

// ─── Especialidad ───────────────────────────────────────────────────────────────
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface EspecialidadRequest {
  nombre: string;
  descripcion?: string;
}

// ─── Médico ─────────────────────────────────────────────────────────────────────
export interface Medico {
  id: number;
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  matricula: string;
  especialidad: Especialidad;
  biografia?: string;
  activo: boolean;
}

export interface MedicoRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  matricula: string;
  especialidadId: number;
  biografia?: string;
}

// ─── Paciente ───────────────────────────────────────────────────────────────────
export interface Paciente {
  id: number;
  usuarioId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  obraSocial?: string;
}

// ─── Disponibilidad ─────────────────────────────────────────────────────────────
export interface Disponibilidad {
  id: number;
  medicoId: number;
  medicoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface DisponibilidadRequest {
  medicoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

// ─── Turno ──────────────────────────────────────────────────────────────────────
export interface Turno {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  fechaHora: string;
  estado: EstadoTurno;
  observaciones?: string;
}

export interface TurnoRequest {
  medicoId: number;
  fechaHora: string;
  observaciones?: string;
}

// ─── Error ──────────────────────────────────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
