import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TurnoService } from '../../../core/services/api.services';
import { Turno, EstadoTurno } from '../../../core/models';

@Component({
  selector: 'app-admin-turnos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-header">
      <h1><mat-icon>list_alt</mat-icon> Todos los Turnos</h1>
      <p>{{ filtered().length }} turno(s) encontrado(s)</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar paciente o médico</mat-label>
        <input matInput [formControl]="searchCtrl">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>
      <mat-form-field appearance="outline" class="filter-select">
        <mat-label>Estado</mat-label>
        <mat-select [formControl]="estadoCtrl">
          <mat-option [value]="null">Todos</mat-option>
          @for (e of estados; track e.value) {
            <mat-option [value]="e.value">{{ e.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="paginated()" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let t">{{ t.id }}</td>
          </ng-container>
          <ng-container matColumnDef="paciente">
            <th mat-header-cell *matHeaderCellDef>Paciente</th>
            <td mat-cell *matCellDef="let t"><strong>{{ t.pacienteNombre }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="medico">
            <th mat-header-cell *matHeaderCellDef>Médico</th>
            <td mat-cell *matCellDef="let t">
              <div>{{ t.medicoNombre }}</div>
              <div class="cell-sub">{{ t.especialidad }}</div>
            </td>
          </ng-container>
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha y Hora</th>
            <td mat-cell *matCellDef="let t">
              {{ t.fechaHora | date:'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>
          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let t">
              <mat-chip [class]="'chip-' + t.estado.toLowerCase()">{{ estadoLabel(t.estado) }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let t">
              @if (puedeCancelar(t)) {
                <button mat-icon-button color="warn" (click)="cancelar(t)" matTooltip="Cancelar turno">
                  <mat-icon>cancel</mat-icon>
                </button>
              }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>

        @if (filtered().length === 0) {
          <div class="empty-table">No se encontraron turnos</div>
        }

        <mat-paginator
          [length]="filtered().length"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPage($event)"
          showFirstLastButtons />
      </mat-card>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 20px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { flex: 2; min-width: 240px; }
    .filter-select { flex: 1; min-width: 160px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    table { width: 100%; }
    .cell-sub { font-size: 0.78rem; color: #666; }
    .empty-table { text-align: center; padding: 32px; color: #999; }
    .chip-pendiente  { background: #fff3e0 !important; color: #e65100 !important; }
    .chip-confirmado { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-cancelado  { background: #ffebee !important; color: #c62828 !important; }
    .chip-completado { background: #e3f2fd !important; color: #1565c0 !important; }
  `]
})
export class AdminTurnosComponent implements OnInit {
  loading = signal(true);
  turnos = signal<Turno[]>([]);
  pageIndex = signal(0);
  pageSize = 10;

  searchCtrl = new FormControl('');
  estadoCtrl = new FormControl<EstadoTurno | null>(null);

  cols = ['id', 'paciente', 'medico', 'fecha', 'estado', 'acciones'];
  estados = [
    { value: EstadoTurno.PENDIENTE,  label: 'Pendiente' },
    { value: EstadoTurno.CONFIRMADO, label: 'Confirmado' },
    { value: EstadoTurno.CANCELADO,  label: 'Cancelado' },
    { value: EstadoTurno.COMPLETADO, label: 'Completado' },
  ];

  filtered = computed(() => {
    const txt = (this.searchCtrl.value ?? '').toLowerCase();
    const est = this.estadoCtrl.value;
    return this.turnos().filter(t => {
      const matchTxt = !txt || t.pacienteNombre.toLowerCase().includes(txt) || t.medicoNombre.toLowerCase().includes(txt);
      const matchEst = !est || t.estado === est;
      return matchTxt && matchEst;
    });
  });

  paginated = computed(() => {
    const s = this.pageIndex() * this.pageSize;
    return this.filtered().slice(s, s + this.pageSize);
  });

  constructor(private turnoService: TurnoService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargar();
    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.pageIndex.set(0));
    this.estadoCtrl.valueChanges.subscribe(() => this.pageIndex.set(0));
  }

  cargar(): void {
    this.loading.set(true);
    this.turnoService.getAll().subscribe({
      next: t => { this.turnos.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cancelar(t: Turno): void {
    if (!confirm('¿Cancelar este turno?')) return;
    this.turnoService.cancelar(t.id).subscribe({
      next: () => { this.snackBar.open('Turno cancelado', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 })
    });
  }

  puedeCancelar(t: Turno): boolean {
    return t.estado === EstadoTurno.PENDIENTE || t.estado === EstadoTurno.CONFIRMADO;
  }

  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize = e.pageSize; }

  estadoLabel(e: EstadoTurno): string {
    return { PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', CANCELADO: 'Cancelado', COMPLETADO: 'Completado' }[e];
  }
}
