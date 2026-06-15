import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EspecialidadService } from '../../../core/services/api.services';
import { Especialidad } from '../../../core/models';

@Component({
  selector: 'app-admin-especialidades',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1><mat-icon>category</mat-icon> Especialidades</h1>
        <p>Gestión de especialidades médicas del sistema</p>
      </div>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> Nueva
      </button>
    </div>

    <!-- Form -->
    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId() ? 'Editar' : 'Nueva' }} Especialidad</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="esp-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Cardiología">
              <mat-error>El nombre es requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="2"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="18" /> }
		@else {
                  <ng-container>
                    <mat-icon>save</mat-icon> Guardar
                  </ng-container>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Table -->
    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="especialidades()" class="full-width">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let e">{{ e.id }}</td>
          </ng-container>
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let e"><strong>{{ e.nombre }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="descripcion">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let e">{{ e.descripcion ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let e">
              <button mat-icon-button color="primary" (click)="edit(e)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(e)" matTooltip="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        @if (especialidades().length === 0) {
          <div class="empty-table">No hay especialidades registradas</div>
        }
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .form-card { border-radius: 12px !important; margin-bottom: 20px; }
    .esp-form { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    table { width: 100%; }
    .empty-table { text-align: center; padding: 24px; color: #999; }
  `]
})
export class AdminEspecialidadesComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  especialidades = signal<Especialidad[]>([]);
  cols = ['id', 'nombre', 'descripcion', 'acciones'];

  form = this.fb.group({
    nombre:      ['', Validators.required],
    descripcion: ['']
  });

  constructor(
    private fb: FormBuilder,
    private especialidadService: EspecialidadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.especialidadService.getAll().subscribe({
      next: e => { this.especialidades.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(): void { this.form.reset(); this.editingId.set(null); this.showForm.set(true); }

  edit(e: Especialidad): void {
    this.editingId.set(e.id);
    this.form.patchValue({ nombre: e.nombre, descripcion: e.descripcion ?? '' });
    this.showForm.set(true);
  }

  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value as any;
    const obs = this.editingId()
      ? this.especialidadService.update(this.editingId()!, data)
      : this.especialidadService.create(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Guardado ✅', 'Cerrar', { duration: 3000 });
        this.cancelForm(); this.cargar(); this.saving.set(false);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 });
      }
    });
  }

  delete(e: Especialidad): void {
    if (!confirm(`¿Eliminar "${e.nombre}"?`)) return;
    this.especialidadService.delete(e.id).subscribe({
      next: () => { this.snackBar.open('Eliminada', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 })
    });
  }
}
