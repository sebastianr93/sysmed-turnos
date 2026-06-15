import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Especialidad, EspecialidadRequest,
  Medico, MedicoRequest,
  Disponibilidad, DisponibilidadRequest,
  Turno, TurnoRequest
} from '../models';
import { environment } from '../../../environments/environment';

// ─── Especialidad Service ──────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private url = `${environment.apiUrl}/especialidades`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.url);
  }

  getById(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.url}/${id}`);
  }

  create(data: EspecialidadRequest): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.url, data);
  }

  update(id: number, data: EspecialidadRequest): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

// ─── Médico Service ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class MedicoService {
  private url = `${environment.apiUrl}/medicos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.url);
  }

  getById(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.url}/${id}`);
  }

  getByEspecialidad(especialidadId: number): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.url}/especialidad/${especialidadId}`);
  }

  create(data: MedicoRequest): Observable<Medico> {
    return this.http.post<Medico>(this.url, data);
  }

  update(id: number, data: MedicoRequest): Observable<Medico> {
    return this.http.put<Medico>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

// ─── Disponibilidad Service ────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private url = `${environment.apiUrl}/disponibilidades`;

  constructor(private http: HttpClient) {}

  getByMedico(medicoId: number): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.url}/medico/${medicoId}`);
  }

  create(data: DisponibilidadRequest): Observable<Disponibilidad> {
    return this.http.post<Disponibilidad>(this.url, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

// ─── Turno Service ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class TurnoService {
  private url = `${environment.apiUrl}/turnos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.url);
  }

  getById(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.url}/${id}`);
  }

  getMisTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.url}/mis-turnos`);
  }

  getAgenda(): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.url}/agenda`);
  }

  reservar(data: TurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.url, data);
  }

  cancelar(id: number): Observable<Turno> {
    return this.http.put<Turno>(`${this.url}/${id}/cancelar`, {});
  }

  confirmar(id: number): Observable<Turno> {
    return this.http.put<Turno>(`${this.url}/${id}/confirmar`, {});
  }

  completar(id: number): Observable<Turno> {
    return this.http.put<Turno>(`${this.url}/${id}/completar`, {});
  }
}
