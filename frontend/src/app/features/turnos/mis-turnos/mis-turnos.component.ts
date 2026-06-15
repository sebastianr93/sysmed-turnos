import { Component, OnInit, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { TurnoService } from '../../../core/services/api.services';
import { Turno, EstadoTurno } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule, MatMenuModule
  ],
  template: `
    <div class="page-header">
      <h1><mat-icon>event_note</mat-icon> Mis Turnos</h1>
      <p>Historial y estado de sus turnos</p>
    </div>

    <!-- Estado filter chips -->
    <div class="filter-chips">
      <button mat-stroked-button [class.active]="filtroEstado() === null"
              (click)="filtroEstado.set(null)">
        Todos ({{ turnos().length }})
      </button>
      @for (estado of estados; track estado.value) {
        <button mat-stroked-button
                [class.active]="filtroEstado() === estado.value"
                [class]="'chip-btn-' + estado.value.toLowerCase()"
                (click)="filtroEstado.set(estado.value)">
          <mat-icon>{{ estado.icon }}</mat-icon>
          {{ estado.label }} ({{ countByEstado(estado.value) }})
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <mat-icon>event_note</mat-icon>
        <h3>Sin turnos</h3>
        <p>{{ filtroEstado() ? 'No hay turnos en este estado' : 'Aún no tiene turnos registrados' }}</p>
      </div>
    } @else {
      <div class="turnos-list">
        @for (turno of paginated(); track turno.id) {
          <mat-card class="turno-card" [class]="'estado-' + turno.estado.toLowerCase()">
            <div class="turno-header">
              <div class="turno-main-info">
                <div class="turno-avatar">{{ turnoIcon(turno) }}</div>
                <div>
                  <div class="turno-persona">{{ auth.isPaciente() ? turno.medicoNombre : turno.pacienteNombre }}</div>
                  <div class="turno-esp">{{ turno.especialidad }}</div>
                </div>
              </div>
              <mat-chip [class]="'chip-' + turno.estado.toLowerCase()">
                <mat-icon matChipAvatar>{{ estadoIcon(turno.estado) }}</mat-icon>
                {{ estadoLabel(turno.estado) }}
              </mat-chip>
            </div>

            <div class="turno-body">
              <div class="turno-detail">
                <mat-icon>schedule</mat-icon>
                <span>{{ turno.fechaHora | date:'EEEE dd/MM/yyyy':'':'es' }} a las {{ turno.fechaHora | date:'HH:mm' }}</span>
              </div>
              @if (turno.observaciones) {
                <div class="turno-detail">
                  <mat-icon>notes</mat-icon>
                  <span>{{ turno.observaciones }}</span>
                </div>
              }
            </div>

            <div class="turno-actions">
              @if (puedeCancelar(turno)) {
                <button mat-stroked-button color="warn" (click)="cancelar(turno)">
                  <mat-icon>cancel</mat-icon> Cancelar
                </button>
              }
            </div>
          </mat-card>
        }
      </div>

      <!-- Pagination -->
      @if (filtered().length > pageSize) {
        <mat-paginator
          [length]="filtered().length"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20]"
          (page)="onPage($event)"
          showFirstLastButtons />
      }
    }
  `,
  styles: [`
    .page-header { margin-bottom: 20px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;
      button { border-radius: 20px !important; font-size: 0.82rem;
        mat-icon { font-size: 16px; vertical-align: middle; }
        &.active { background: #1a237e; color: white; }
      }
    }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .empty-state { text-align: center; padding: 48px; color: #999;
      mat-icon { font-size: 56px; width: 56px; height: 56px; color: #ddd; display: block; margin: 0 auto 12px; }
      h3 { margin: 0 0 4px; }
    }
    .turnos-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }

    .turno-card {
      border-radius: 12px !important;
      border-left: 4px solid #e0e0e0;
      &.estado-pendiente  { border-left-color: #ff8f00; }
      &.estado-confirmado { border-left-color: #2e7d32; }
      &.estado-cancelado  { border-left-color: #c62828; }
      &.estado-completado { border-left-color: #1565c0; }
    }

    .turno-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 8px; flex-wrap: wrap; gap: 8px; }
    .turno-main-info { display: flex; align-items: center; gap: 12px; }
    .turno-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: #e8eaf6; color: #3949ab;
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    }
    .turno-persona { font-weight: 600; font-size: 0.95rem; }
    .turno-esp { font-size: 0.8rem; color: #666; }

    .turno-body { padding: 0 16px 8px; display: flex; flex-direction: column; gap: 6px; }
    .turno-detail { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #555;
      mat-icon { font-size: 16px; color: #3949ab; }
    }

    .turno-actions { padding: 8px 16px 12px; display: flex; justify-content: flex-end; gap: 8px; }

    .chip-pendiente  { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-confirmado { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-cancelado  { background: #ffebee !important; color: #c62828 !important; }
    .chip-completado { background: #e3f2fd !important; color: #1565c0 !important; }
  `]
})
export class MisTurnosComponent implements OnInit {
  loading = signal(true);
  turnos = signal<Turno[]>([]);
  filtroEstado = signal<EstadoTurno | null>(null);
  pageIndex = signal(0);
  pageSize = 10;

  filtered = computed(() => {
    const f = this.filtroEstado();
    return f ? this.turnos().filter(t => t.estado === f) : this.turnos();
  });

  paginated = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  estados = [
    { value: EstadoTurno.PENDIENTE,  label: 'Pendientes',  icon: 'schedule' },
    { value: EstadoTurno.CONFIRMADO, label: 'Confirmados', icon: 'check_circle' },
    { value: EstadoTurno.COMPLETADO, label: 'Completados', icon: 'task_alt' },
    { value: EstadoTurno.CANCELADO,  label: 'Cancelados',  icon: 'cancel' },
  ];

  constructor(
    public auth: AuthService,
    private turnoService: TurnoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.turnoService.getMisTurnos().subscribe({
      next: t => { this.turnos.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cancelar(turno: Turno): void {
    if (!confirm(`¿Cancelar el turno del ${new Date(turno.fechaHora).toLocaleDateString()}?`)) return;
    this.turnoService.cancelar(turno.id).subscribe({
      next: () => {
        this.snackBar.open('Turno cancelado', 'Cerrar', { duration: 3000 });
        this.cargar();
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Error al cancelar', 'Cerrar', { duration: 4000 })
    });
  }

  puedeCancelar(t: Turno): boolean {
    return t.estado === EstadoTurno.PENDIENTE || t.estado === EstadoTurno.CONFIRMADO;
  }

  countByEstado(estado: EstadoTurno): number {
    return this.turnos().filter(t => t.estado === estado).length;
  }

  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize = e.pageSize; }

  estadoLabel(e: EstadoTurno): string {
    return { PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', CANCELADO: 'Cancelado', COMPLETADO: 'Completado' }[e];
  }

  estadoIcon(e: EstadoTurno): string {
    return { PENDIENTE: 'schedule', CONFIRMADO: 'check_circle', CANCELADO: 'cancel', COMPLETADO: 'task_alt' }[e];
  }

  turnoIcon(t: Turno): string { return '🏥'; }
}
