import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MedicoService, EspecialidadService, DisponibilidadService, TurnoService } from '../../../core/services/api.services';
import { Medico, Especialidad, Disponibilidad } from '../../../core/models';

@Component({
  selector: 'app-reservar-turno',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatStepperModule
  ],
  template: `
    <div class="page-header">
      <h1><mat-icon>event_available</mat-icon> Reservar Turno</h1>
      <p>Seleccioná tu médico y horario preferido</p>
    </div>

    <mat-card class="reservar-card">
      <mat-card-content>
        <mat-stepper linear #stepper>

          <!-- STEP 1: Seleccionar médico -->
          <mat-step label="Seleccionar Médico" [stepControl]="medicoForm">
            <form [formGroup]="medicoForm" class="step-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Especialidad</mat-label>
                <mat-select formControlName="especialidadId" (selectionChange)="onEspecialidadChange($event.value)">
                  <mat-option [value]="null">Todas las especialidades</mat-option>
                  @for (esp of especialidades(); track esp.id) {
                    <mat-option [value]="esp.id">{{ esp.nombre }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>category</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Médico *</mat-label>
                <mat-select formControlName="medicoId" (selectionChange)="onMedicoChange($event.value)">
                  @for (m of medicosFiltrados(); track m.id) {
                    <mat-option [value]="m.id">
                      Dr. {{ m.nombre }} {{ m.apellido }} — {{ m.especialidad.nombre }}
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>person</mat-icon>
                @if (medicoForm.get('medicoId')?.invalid && medicoForm.get('medicoId')?.touched) {
                  <mat-error>Seleccione un médico</mat-error>
                }
              </mat-form-field>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext
                        [disabled]="medicoForm.invalid" type="button">
                  Siguiente <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 2: Seleccionar horario -->
          <mat-step label="Elegir Horario" [stepControl]="horarioForm">
            <form [formGroup]="horarioForm" class="step-form">
              @if (disponibilidades().length > 0) {
                <p class="hint">Seleccioná un horario disponible:</p>
                <div class="disps-grid">
                  @for (d of disponibilidades(); track d.id) {
                    <div class="disp-slot"
                         [class.selected]="selectedDisp() === d.id"
                         (click)="selectDisp(d)">
                      <mat-icon>event</mat-icon>
                      <div>
                        <div class="slot-date">{{ d.fecha | date:'EEE dd/MM':'':'es' }}</div>
                        <div class="slot-time">{{ d.horaInicio }} — {{ d.horaFin }}</div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-disps">
                  <mat-icon>event_busy</mat-icon>
                  <p>No hay disponibilidades para este médico</p>
                </div>
              }

              <mat-form-field appearance="outline" class="full-width" style="margin-top:16px">
                <mat-label>Fecha y hora exacta *</mat-label>
                <input matInput type="datetime-local" formControlName="fechaHora">
                @if (horarioForm.get('fechaHora')?.invalid && horarioForm.get('fechaHora')?.touched) {
                  <mat-error>Seleccione una fecha y hora</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Observaciones (opcional)</mat-label>
                <textarea matInput formControlName="observaciones" rows="3"
                          placeholder="Motivo de la consulta, síntomas, etc."></textarea>
              </mat-form-field>

              <div class="step-actions">
                <button mat-button matStepperPrevious type="button">
                  <mat-icon>arrow_back</mat-icon> Anterior
                </button>
                <button mat-raised-button color="primary" matStepperNext
                        [disabled]="horarioForm.invalid" type="button">
                  Confirmar <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 3: Confirmación -->
          <mat-step label="Confirmar">
            <div class="confirm-step">
              <mat-icon class="confirm-icon">check_circle</mat-icon>
              <h3>¿Confirmar la reserva?</h3>

              @if (medicoSeleccionado()) {
                <div class="confirm-details">
                  <div class="detail-row">
                    <mat-icon>person</mat-icon>
                    <span>Dr. {{ medicoSeleccionado()!.nombre }} {{ medicoSeleccionado()!.apellido }}</span>
                  </div>
                  <div class="detail-row">
                    <mat-icon>category</mat-icon>
                    <span>{{ medicoSeleccionado()!.especialidad.nombre }}</span>
                  </div>
                  <div class="detail-row">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ horarioForm.value.fechaHora | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  @if (horarioForm.value.observaciones) {
                    <div class="detail-row">
                      <mat-icon>notes</mat-icon>
                      <span>{{ horarioForm.value.observaciones }}</span>
                    </div>
                  }
                </div>
              }

              <div class="step-actions">
                <button mat-button matStepperPrevious type="button">
                  <mat-icon>arrow_back</mat-icon> Anterior
                </button>
                <button mat-raised-button color="primary" type="button"
                        (click)="confirmarReserva()" [disabled]="loading()">
		@if (loading()) { <mat-spinner diameter="20" /> }
                  @else {
                    <ng-container>
                      <mat-icon>check</mat-icon> Confirmar Reserva
                    </ng-container>
                  }
                </button>
              </div>
            </div>
          </mat-step>

        </mat-stepper>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { margin-bottom: 24px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .reservar-card { border-radius: 16px !important; max-width: 700px; }
    .step-form { display: flex; flex-direction: column; gap: 8px; padding: 16px 0 0; }
    .full-width { width: 100%; }
    .step-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .hint { color: #666; margin-bottom: 12px; }
    .disps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 8px; }
    .disp-slot {
      display: flex; align-items: center; gap: 10px;
      padding: 12px; border-radius: 10px; border: 2px solid #e0e0e0;
      cursor: pointer; transition: all .2s;
      mat-icon { color: #3949ab; }
      .slot-date { font-weight: 600; font-size: 0.85rem; text-transform: capitalize; }
      .slot-time { font-size: 0.78rem; color: #666; }
      &:hover { border-color: #3949ab; background: #f0f4ff; }
      &.selected { border-color: #1a237e; background: #e8eaf6; }
    }
    .empty-disps { text-align: center; padding: 32px; color: #999;
      mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }
    }
    .confirm-step { display: flex; flex-direction: column; align-items: center; padding: 24px 0 8px; }
    .confirm-icon { font-size: 64px; width: 64px; height: 64px; color: #2e7d32; margin-bottom: 12px; }
    .confirm-details {
      width: 100%; background: #f8f9fa; border-radius: 12px; padding: 16px; margin: 12px 0 24px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .detail-row { display: flex; align-items: center; gap: 10px; font-size: 0.95rem;
      mat-icon { color: #3949ab; font-size: 20px; }
    }
  `]
})
export class ReservarTurnoComponent implements OnInit {
  loading = signal(false);
  medicos = signal<Medico[]>([]);
  medicosFiltrados = signal<Medico[]>([]);
  especialidades = signal<Especialidad[]>([]);
  disponibilidades = signal<Disponibilidad[]>([]);
  medicoSeleccionado = signal<Medico | null>(null);
  selectedDisp = signal<number | null>(null);

  medicoForm = this.fb.group({
    especialidadId: [null as number | null],
    medicoId: [null as number | null, Validators.required]
  });

  horarioForm = this.fb.group({
    fechaHora:    ['', Validators.required],
    observaciones: ['']
  });

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private dispService: DisponibilidadService,
    private turnoService: TurnoService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.medicoService.getAll().subscribe(m => {
      this.medicos.set(m);
      this.medicosFiltrados.set(m);
    });
    this.especialidadService.getAll().subscribe(e => this.especialidades.set(e));

    const medicoId = this.route.snapshot.queryParamMap.get('medicoId');
    if (medicoId) {
      this.medicoForm.patchValue({ medicoId: Number(medicoId) });
      this.onMedicoChange(Number(medicoId));
    }
  }

  onEspecialidadChange(espId: number | null): void {
    const lista = espId ? this.medicos().filter(m => m.especialidad.id === espId) : this.medicos();
    this.medicosFiltrados.set(lista);
    this.medicoForm.patchValue({ medicoId: null });
  }

  onMedicoChange(medicoId: number): void {
    const m = this.medicos().find(x => x.id === medicoId) ?? null;
    this.medicoSeleccionado.set(m);
    this.dispService.getByMedico(medicoId).subscribe(d => this.disponibilidades.set(d));
  }

  selectDisp(d: Disponibilidad): void {
    this.selectedDisp.set(d.id);
    this.horarioForm.patchValue({ fechaHora: `${d.fecha}T${d.horaInicio}` });
  }

  confirmarReserva(): void {
    this.loading.set(true);
    const medicoId = this.medicoForm.value.medicoId!;
    const fechaHora = new Date(this.horarioForm.value.fechaHora!).toISOString();

    this.turnoService.reservar({
      medicoId,
      fechaHora,
      observaciones: this.horarioForm.value.observaciones || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('✅ Turno reservado exitosamente', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/turnos/mis-turnos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(`❌ ${err.error?.message ?? 'Error al reservar'}`, 'Cerrar', { duration: 5000 });
      }
    });
  }
}
