import { Component, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicoService, DisponibilidadService } from '../../../core/services/api.services';
import { Medico, Disponibilidad } from '../../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-medico-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDividerModule, MatProgressSpinnerModule
  ],
  template: `
    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    } @else if (medico()) {
      <div class="detail-container">

        <!-- Back -->
        <button mat-button routerLink="/medicos" class="back-btn">
          <mat-icon>arrow_back</mat-icon> Volver
        </button>

        <!-- Profile card -->
        <mat-card class="profile-card">
          <div class="profile-header">
            <div class="big-avatar">{{ initials() }}</div>
            <div class="profile-info">
              <h1>Dr. {{ medico()!.nombre }} {{ medico()!.apellido }}</h1>
              <mat-chip class="esp-chip">{{ medico()!.especialidad.nombre }}</mat-chip>
              <p class="matricula"><mat-icon>badge</mat-icon> Matrícula: {{ medico()!.matricula }}</p>
            </div>
            <button mat-raised-button color="primary" class="reserve-btn"
                    [routerLink]="'/turnos/reservar'"
                    [queryParams]="{ medicoId: medico()!.id }">
              <mat-icon>event_available</mat-icon>
              Reservar Turno
            </button>
          </div>

          <mat-divider />

          <mat-card-content class="bio-section">
            <h3>Sobre el profesional</h3>
            <p>{{ medico()!.biografia || 'Profesional de la salud con amplia experiencia en su especialidad.' }}</p>
          </mat-card-content>
        </mat-card>

        <!-- Disponibilidades -->
        <mat-card class="disps-card">
          <mat-card-header>
            <mat-card-title><mat-icon>calendar_month</mat-icon> Disponibilidades</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (disponibilidades().length === 0) {
              <div class="empty-disps">
                <mat-icon>event_busy</mat-icon>
                <p>No hay disponibilidades registradas</p>
              </div>
            } @else {
              <div class="disps-grid">
                @for (d of disponibilidades(); track d.id) {
                  <div class="disp-item">
                    <mat-icon>event</mat-icon>
                    <div>
                      <div class="disp-date">{{ d.fecha | date:'EEEE dd/MM/yyyy':'':'es' }}</div>
                      <div class="disp-hours">{{ d.horaInicio }} — {{ d.horaFin }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

      </div>
    }
  `,
  styles: [`
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .detail-container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .back-btn { margin-bottom: 4px; }

    .profile-card { border-radius: 16px !important; }
    .profile-header {
      display: flex; align-items: flex-start; gap: 24px; padding: 24px;
      flex-wrap: wrap;
    }
    .big-avatar {
      width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #1a237e, #3949ab);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem; font-weight: 700; color: white;
    }
    .profile-info {
      flex: 1;
      h1 { margin: 0 0 8px; font-size: 1.5rem; color: #1a237e; }
    }
    .matricula { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #666; margin: 8px 0 0; mat-icon { font-size: 16px; } }
    .reserve-btn { margin-left: auto; height: 48px; }

    .bio-section { padding: 16px 24px 24px !important;
      h3 { color: #1a237e; margin: 0 0 8px; }
      p { color: #555; line-height: 1.6; }
    }

    .disps-card { border-radius: 16px !important; }
    mat-card-header { mat-icon { vertical-align: middle; margin-right: 6px; } }
    .disps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
    .disp-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; background: #f0f4ff; border-radius: 10px;
      mat-icon { color: #3949ab; }
      .disp-date { font-weight: 600; font-size: 0.85rem; text-transform: capitalize; }
      .disp-hours { font-size: 0.8rem; color: #666; }
    }
    .empty-disps { text-align: center; padding: 32px; color: #999;
      mat-icon { font-size: 40px; width: 40px; height: 40px; display: block; margin: 0 auto 8px; }
    }
  `]
})
export class MedicoDetailComponent implements OnInit {
  id = input.required<string>();

  loading = signal(true);
  medico = signal<Medico | null>(null);
  disponibilidades = signal<Disponibilidad[]>([]);

  constructor(
    private medicoService: MedicoService,
    private dispService: DisponibilidadService
  ) {}

  ngOnInit(): void {
    const medicoId = Number(this.id());
    forkJoin({
      medico: this.medicoService.getById(medicoId),
      disps: this.dispService.getByMedico(medicoId)
    }).subscribe({
      next: ({ medico, disps }) => {
        this.medico.set(medico);
        this.disponibilidades.set(disps);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  initials(): string {
    const m = this.medico();
    return m ? `${m.nombre[0]}${m.apellido[0]}`.toUpperCase() : '';
  }
}
