import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MedicoService, EspecialidadService } from '../../../core/services/api.services';
import { Medico, MedicoRequest, Especialidad } from '../../../core/models';

@Component({
  selector: 'app-admin-medicos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatChipsModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h1><mat-icon>manage_accounts</mat-icon> Gestión de Médicos</h1>
        <p>Alta, modificación y baja de profesionales</p>
      </div>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>person_add</mat-icon> Nuevo Médico
      </button>
    </div>

    <!-- Form panel -->
    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId() ? 'Editar Médico' : 'Nuevo Médico' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="medico-form">
            <div class="row-2">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre">
                <mat-error>Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="apellido">
                <mat-error>Requerido</mat-error>
              </mat-form-field>
            </div>
            <div class="row-2">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-error>Email inválido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Matrícula</mat-label>
                <input matInput formControlName="matricula" placeholder="MN-12345">
                <mat-error>Requerida</mat-error>
              </mat-form-field>
            </div>
            <div class="row-2">
              <mat-form-field appearance="outline">
                <mat-label>Especialidad</mat-label>
                <mat-select formControlName="especialidadId">
                  @for (e of especialidades(); track e.id) {
                    <mat-option [value]="e.id">{{ e.nombre }}</mat-option>
                  }
                </mat-select>
                <mat-error>Requerida</mat-error>
              </mat-form-field>
              @if (!editingId()) {
                <mat-form-field appearance="outline">
                  <mat-label>Contraseña inicial</mat-label>
                  <input matInput type="password" formControlName="password">
                  <mat-error>Mínimo 6 caracteres</mat-error>
                </mat-form-field>
              }
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Biografía</mat-label>
              <textarea matInput formControlName="biografia" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || saving()">
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
        <table mat-table [dataSource]="medicos()" class="full-width">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Médico</th>
            <td mat-cell *matCellDef="let m">
              <div class="cell-medico">
                <div class="mini-avatar">{{ m.nombre[0] }}{{ m.apellido[0] }}</div>
                <div>
                  <div class="cell-name">Dr. {{ m.nombre }} {{ m.apellido }}</div>
                  <div class="cell-sub">{{ m.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="especialidad">
            <th mat-header-cell *matHeaderCellDef>Especialidad</th>
            <td mat-cell *matCellDef="let m">
              <mat-chip>{{ m.especialidad.nombre }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="matricula">
            <th mat-header-cell *matHeaderCellDef>Matrícula</th>
            <td mat-cell *matCellDef="let m">{{ m.matricula }}</td>
          </ng-container>
          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let m">
              <mat-chip [class]="m.activo ? 'chip-activo' : 'chip-inactivo'">
                {{ m.activo ? 'Activo' : 'Inactivo' }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let m">
              <button mat-icon-button color="primary" (click)="edit(m)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deactivate(m)" matTooltip="Desactivar">
                <mat-icon>person_off</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .form-card { border-radius: 12px !important; margin-bottom: 20px; }
    .medico-form { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    table { width: 100%; }
    .cell-medico { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
    .mini-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #e8eaf6; color: #3949ab; font-weight: 700;
      display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
    }
    .cell-name { font-weight: 600; font-size: 0.9rem; }
    .cell-sub { font-size: 0.78rem; color: #666; }
    .chip-activo   { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactivo { background: #ffebee !important; color: #c62828 !important; }
  `]
})
export class AdminMedicosComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  medicos = signal<Medico[]>([]);
  especialidades = signal<Especialidad[]>([]);

  cols = ['nombre', 'especialidad', 'matricula', 'estado', 'acciones'];

  form = this.fb.group({
    nombre:        ['', Validators.required],
    apellido:      ['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    password:      ['', [Validators.required, Validators.minLength(6)]],
    matricula:     ['', Validators.required],
    especialidadId:[null as number | null, Validators.required],
    biografia:     ['']
  });

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.especialidadService.getAll().subscribe(e => this.especialidades.set(e));
  }

  cargar(): void {
    this.loading.set(true);
    this.medicoService.getAll().subscribe({
      next: m => { this.medicos.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(): void {
    this.form.reset();
    this.editingId.set(null);
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')!.updateValueAndValidity();
    this.showForm.set(true);
  }

  edit(m: Medico): void {
    this.editingId.set(m.id);
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.form.patchValue({
      nombre: m.nombre, apellido: m.apellido, email: m.email,
      matricula: m.matricula, especialidadId: m.especialidad.id, biografia: m.biografia ?? ''
    });
    this.showForm.set(true);
  }

  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value as MedicoRequest;
    const obs = this.editingId()
      ? this.medicoService.update(this.editingId()!, data)
      : this.medicoService.create(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Médico guardado ✅', 'Cerrar', { duration: 3000 });
        this.cancelForm();
        this.cargar();
        this.saving.set(false);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
      }
    });
  }

  deactivate(m: Medico): void {
    if (!confirm(`¿Desactivar al Dr. ${m.nombre} ${m.apellido}?`)) return;
    this.medicoService.delete(m.id).subscribe({
      next: () => { this.snackBar.open('Médico desactivado', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Cerrar', { duration: 4000 })
    });
  }
}
