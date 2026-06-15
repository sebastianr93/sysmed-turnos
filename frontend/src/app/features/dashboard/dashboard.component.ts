import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TurnoService } from '../../core/services/api.services';
import { Rol, Turno, EstadoTurno } from '../../core/models';

interface StatCard { label: string; value: number; icon: string; color: string; route?: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome header -->
      <div class="welcome-header">
        <div>
          <h1>Bienvenido, {{ auth.currentUser()?.nombre }} 👋</h1>
          <p>{{ rolWelcome() }}</p>
        </div>
        @if (auth.isPaciente()) {
          <button mat-raised-button color="primary" routerLink="/turnos/reservar">
            <mat-icon>event_available</mat-icon>
            Reservar Turno
          </button>
        }
      </div>

      <!-- Stats cards -->
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        <div class="stats-grid">
          @for (card of statCards(); track card.label) {
            <mat-card class="stat-card" [routerLink]="card.route" [style.cursor]="card.route ? 'pointer' : 'default'">
              <div class="stat-content">
                <div class="stat-icon" [style.background]="card.color">
                  <mat-icon>{{ card.icon }}</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ card.value }}</span>
                  <span class="stat-label">{{ card.label }}</span>
                </div>
              </div>
            </mat-card>
          }
        </div>

        <!-- Recent turnos -->
        @if (recentTurnos().length > 0) {
          <mat-card class="recent-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>event_note</mat-icon>
                Turnos Recientes
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="turno-list">
                @for (turno of recentTurnos(); track turno.id) {
                  <div class="turno-item">
                    <div class="turno-info">
                      <mat-icon class="turno-icon">calendar_today</mat-icon>
                      <div>
                        <div class="turno-title">
                          {{ auth.isPaciente() ? turno.medicoNombre : turno.pacienteNombre }}
                        </div>
                        <div class="turno-sub">
                          {{ turno.fechaHora | date:'dd/MM/yyyy HH:mm' }} · {{ turno.especialidad }}
                        </div>
                      </div>
                    </div>
                    <mat-chip [class]="'chip-' + turno.estado.toLowerCase()">
                      {{ estadoLabel(turno.estado) }}
                    </mat-chip>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; }

    .welcome-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
      h1 { margin: 0 0 4px; font-size: 1.75rem; font-weight: 700; color: #1a237e; }
      p { margin: 0; color: #666; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 12px !important;
      transition: transform .2s, box-shadow .2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
    }

    .stat-content { display: flex; align-items: center; gap: 16px; padding: 20px; }

    .stat-icon {
      width: 56px; height: 56px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    }

    .stat-value { display: block; font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { display: block; font-size: 0.85rem; color: #666; margin-top: 4px; }

    .loading-center { display: flex; justify-content: center; padding: 48px; }

    .recent-card { border-radius: 12px !important; }
    mat-card-header { padding-bottom: 0; mat-icon { vertical-align: middle; margin-right: 8px; } }

    .turno-list { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }

    .turno-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px; border-radius: 8px; background: #f8f9fa;
    }

    .turno-info { display: flex; align-items: center; gap: 12px; }
    .turno-icon { color: #1a237e; }
    .turno-title { font-weight: 600; font-size: 0.9rem; }
    .turno-sub { font-size: 0.8rem; color: #666; }

    .chip-pendiente   { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-confirmado  { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-cancelado   { background: #ffebee !important; color: #c62828 !important; }
    .chip-completado  { background: #e3f2fd !important; color: #1565c0 !important; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  turnos = signal<Turno[]>([]);

  recentTurnos = computed(() => this.turnos().slice(0, 5));

  statCards = computed((): StatCard[] => {
    const t = this.turnos();
    if (this.auth.isPaciente()) {
      return [
        { label: 'Total Turnos',     value: t.length,                                              icon: 'event_note',      color: '#1a237e', route: '/turnos/mis-turnos' },
        { label: 'Pendientes',       value: t.filter(x => x.estado === EstadoTurno.PENDIENTE).length,  icon: 'schedule',        color: '#e65100' },
        { label: 'Confirmados',      value: t.filter(x => x.estado === EstadoTurno.CONFIRMADO).length, icon: 'check_circle',    color: '#2e7d32' },
        { label: 'Completados',      value: t.filter(x => x.estado === EstadoTurno.COMPLETADO).length, icon: 'task_alt',        color: '#1565c0' },
      ];
    }
    if (this.auth.isMedico()) {
      return [
        { label: 'Total en Agenda',  value: t.length,                                              icon: 'calendar_month',  color: '#1a237e', route: '/turnos/agenda' },
        { label: 'Por Confirmar',    value: t.filter(x => x.estado === EstadoTurno.PENDIENTE).length,  icon: 'pending_actions', color: '#e65100' },
        { label: 'Confirmados Hoy',  value: t.filter(x => x.estado === EstadoTurno.CONFIRMADO).length, icon: 'event_available', color: '#2e7d32' },
        { label: 'Completados',      value: t.filter(x => x.estado === EstadoTurno.COMPLETADO).length, icon: 'task_alt',        color: '#1565c0' },
      ];
    }
    // Admin
    return [
      { label: 'Total Turnos',     value: t.length,                                              icon: 'list_alt',        color: '#1a237e', route: '/admin/turnos' },
      { label: 'Pendientes',       value: t.filter(x => x.estado === EstadoTurno.PENDIENTE).length,  icon: 'pending',         color: '#e65100' },
      { label: 'Confirmados',      value: t.filter(x => x.estado === EstadoTurno.CONFIRMADO).length, icon: 'check_circle',    color: '#2e7d32' },
      { label: 'Cancelados',       value: t.filter(x => x.estado === EstadoTurno.CANCELADO).length,  icon: 'cancel',          color: '#c62828' },
    ];
  });

  rolWelcome = computed(() => {
    if (this.auth.isAdmin())    return 'Panel de Administración — Gestión integral del sistema';
    if (this.auth.isMedico())   return 'Panel Médico — Gestión de agenda y pacientes';
    if (this.auth.isPaciente()) return 'Portal de Paciente — Gestión de sus turnos médicos';
    return '';
  });

  constructor(public auth: AuthService, private turnoService: TurnoService) {}

  ngOnInit(): void {
    const obs = this.auth.isAdmin()   ? this.turnoService.getAll()
              : this.auth.isMedico()  ? this.turnoService.getAgenda()
              :                         this.turnoService.getMisTurnos();

    obs.subscribe({
      next: t => { this.turnos.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  estadoLabel(e: EstadoTurno): string {
    const map: Record<EstadoTurno, string> = {
      PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado',
      CANCELADO: 'Cancelado', COMPLETADO: 'Completado'
    };
    return map[e];
  }
}
