import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { TurnoService } from '../../../core/services/api.services';
import { Turno, EstadoTurno } from '../../../core/models';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTabsModule
  ],
  template: `
    <div class="page-header">
      <h1><mat-icon>calendar_month</mat-icon> Mi Agenda</h1>
      <p>Gestión de turnos asignados</p>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    } @else {
      <mat-tab-group dynamicHeight>

        <mat-tab label="Pendientes ({{ pendientes().length }})">
          <div class="tab-content">
            @if (pendientes().length === 0) {
              <div class="empty-state"><mat-icon>inbox</mat-icon><p>No hay turnos pendientes</p></div>
            }
            @for (t of pendientes(); track t.id) {
              <ng-container [ngTemplateOutlet]="turnoCard" [ngTemplateOutletContext]="{ turno: t }" />
            }
          </div>
        </mat-tab>

        <mat-tab label="Confirmados ({{ confirmados().length }})">
          <div class="tab-content">
            @if (confirmados().length === 0) {
              <div class="empty-state"><mat-icon>event_available</mat-icon><p>No hay turnos confirmados</p></div>
            }
            @for (t of confirmados(); track t.id) {
              <ng-container [ngTemplateOutlet]="turnoCard" [ngTemplateOutletContext]="{ turno: t }" />
            }
          </div>
        </mat-tab>

        <mat-tab label="Historial">
          <div class="tab-content">
            @for (t of historial(); track t.id) {
              <ng-container [ngTemplateOutlet]="turnoCard" [ngTemplateOutletContext]="{ turno: t }" />
            }
          </div>
        </mat-tab>

      </mat-tab-group>
    }

    <!-- Turno card template -->
    <ng-template #turnoCard let-turno="turno">
      <mat-card class="turno-card" [class]="'estado-' + turno.estado.toLowerCase()">
        <div class="turno-row">
          <div class="turno-info">
            <div class="patient-name">
              <mat-icon>person</mat-icon>
              {{ turno.pacienteNombre }}
            </div>
            <div class="turno-datetime">
              <mat-icon>schedule</mat-icon>
              {{ turno.fechaHora | date:'dd/MM/yyyy' }} a las {{ turno.fechaHora | date:'HH:mm' }}
            </div>
            @if (turno.observaciones) {
              <div class="turno-obs">
                <mat-icon>notes</mat-icon> {{ turno.observaciones }}
              </div>
            }
          </div>
          <div class="turno-right">
            <mat-chip [class]="'chip-' + turno.estado.toLowerCase()">
              {{ estadoLabel(turno.estado) }}
            </mat-chip>
            <div class="action-btns">
              @if (turno.estado === 'PENDIENTE') {
                <button mat-raised-button color="primary" (click)="confirmar(turno)">
                  <mat-icon>check</mat-icon> Confirmar
                </button>
                <button mat-stroked-button color="warn" (click)="cancelar(turno)">
                  <mat-icon>close</mat-icon> Cancelar
                </button>
              }
              @if (turno.estado === 'CONFIRMADO') {
                <button mat-raised-button color="accent" (click)="completar(turno)">
                  <mat-icon>task_alt</mat-icon> Completar
                </button>
                <button mat-stroked-button color="warn" (click)="cancelar(turno)">
                  <mat-icon>close</mat-icon> Cancelar
                </button>
              }
            </div>
          </div>
        </div>
      </mat-card>
    </ng-template>
  `,
  styles: [`
    .page-header { margin-bottom: 20px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .tab-content { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
    .empty-state { text-align: center; padding: 32px; color: #999;
      mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; color: #ddd; }
    }
    .turno-card {
      border-radius: 12px !important; border-left: 4px solid transparent;
      &.estado-pendiente  { border-left-color: #ff8f00; }
      &.estado-confirmado { border-left-color: #2e7d32; }
      &.estado-cancelado  { border-left-color: #c62828; }
      &.estado-completado { border-left-color: #1565c0; }
    }
    .turno-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 16px; gap: 16px; flex-wrap: wrap; }
    .turno-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .patient-name { font-weight: 600; font-size: 1rem; display: flex; align-items: center; gap: 6px; mat-icon { color: #3949ab; font-size: 18px; } }
    .turno-datetime, .turno-obs { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #666; mat-icon { font-size: 16px; } }
    .turno-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .action-btns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .chip-pendiente  { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-confirmado { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-cancelado  { background: #ffebee !important; color: #c62828 !important; }
    .chip-completado { background: #e3f2fd !important; color: #1565c0 !important; }
  `]
})
export class AgendaComponent implements OnInit {
  loading = signal(true);
  turnos = signal<Turno[]>([]);

  pendientes  = computed(() => this.turnos().filter(t => t.estado === EstadoTurno.PENDIENTE));
  confirmados = computed(() => this.turnos().filter(t => t.estado === EstadoTurno.CONFIRMADO));
  historial   = computed(() => this.turnos().filter(t =>
    t.estado === EstadoTurno.COMPLETADO || t.estado === EstadoTurno.CANCELADO));

  constructor(private turnoService: TurnoService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.turnoService.getAgenda().subscribe({
      next: t => { this.turnos.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  confirmar(t: Turno): void {
    this.turnoService.confirmar(t.id).subscribe({
      next: () => { this.snackBar.open('Turno confirmado ✅', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 })
    });
  }

  completar(t: Turno): void {
    this.turnoService.completar(t.id).subscribe({
      next: () => { this.snackBar.open('Turno completado ✅', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 })
    });
  }

  cancelar(t: Turno): void {
    if (!confirm('¿Cancelar este turno?')) return;
    this.turnoService.cancelar(t.id).subscribe({
      next: () => { this.snackBar.open('Turno cancelado', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 })
    });
  }

  estadoLabel(e: EstadoTurno): string {
    return { PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', CANCELADO: 'Cancelado', COMPLETADO: 'Completado' }[e];
  }
}
