import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MedicoService, EspecialidadService } from '../../../core/services/api.services';
import { Medico, Especialidad } from '../../../core/models';

@Component({
  selector: 'app-medicos-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <h1><mat-icon>medical_services</mat-icon> Médicos</h1>
      <p>Encontrá el profesional que necesitás</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar médico</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Nombre, apellido...">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Especialidad</mat-label>
        <mat-select [formControl]="especialidadCtrl">
          <mat-option [value]="null">Todas</mat-option>
          @for (esp of especialidades(); track esp.id) {
            <mat-option [value]="esp.id">{{ esp.nombre }}</mat-option>
          }
        </mat-select>
        <mat-icon matPrefix>category</mat-icon>
      </mat-form-field>
    </div>

    <!-- Results -->
    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <mat-icon>search_off</mat-icon>
        <p>No se encontraron médicos</p>
      </div>
    } @else {
      <div class="medicos-grid">
        @for (medico of filtered(); track medico.id) {
          <mat-card class="medico-card">
            <div class="medico-avatar">
              <span>{{ initials(medico) }}</span>
            </div>
            <mat-card-header>
              <mat-card-title>Dr. {{ medico.nombre }} {{ medico.apellido }}</mat-card-title>
              <mat-card-subtitle>
                <mat-chip class="esp-chip">{{ medico.especialidad.nombre }}</mat-chip>
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="bio">{{ medico.biografia || 'Profesional de la salud especializado.' }}</p>
              <div class="medico-meta">
                <mat-icon>badge</mat-icon>
                <span>Matrícula: {{ medico.matricula }}</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/medicos', medico.id]">
                <mat-icon>visibility</mat-icon> Ver Perfil
              </button>
              <button mat-raised-button color="primary" routerLink="/turnos/reservar"
                      [queryParams]="{ medicoId: medico.id }">
                <mat-icon>event_available</mat-icon> Reservar
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
      h1 { display: flex; align-items: center; gap: 10px; font-size: 1.75rem; color: #1a237e; margin: 0 0 4px; }
      p { color: #666; margin: 0; }
    }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-field { flex: 2; min-width: 240px; }
    .filter-field { flex: 1; min-width: 180px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .empty-state {
      text-align: center; padding: 48px; color: #999;
      mat-icon { font-size: 48px; width: 48px; height: 48px; }
    }
    .medicos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .medico-card {
      border-radius: 16px !important;
      transition: transform .2s, box-shadow .2s;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
    }
    .medico-avatar {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #1a237e, #3949ab);
      display: flex; align-items: center; justify-content: center;
      margin: 16px auto 8px;
      span { color: white; font-size: 1.5rem; font-weight: 700; }
    }
    .bio { color: #555; font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .medico-meta { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #666; margin-top: 8px; mat-icon { font-size: 16px; } }
    .esp-chip { font-size: 0.75rem !important; height: 24px !important; }
    mat-card-actions { display: flex; gap: 8px; padding: 12px !important; justify-content: flex-end; }
  `]
})
export class MedicosListComponent implements OnInit {
  loading = signal(true);
  medicos = signal<Medico[]>([]);
  especialidades = signal<Especialidad[]>([]);
  filtered = signal<Medico[]>([]);

  searchCtrl = new FormControl('');
  especialidadCtrl = new FormControl<number | null>(null);

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService
  ) {}

  ngOnInit(): void {
    this.medicoService.getAll().subscribe(m => {
      this.medicos.set(m);
      this.filtered.set(m);
      this.loading.set(false);
    });
    this.especialidadService.getAll().subscribe(e => this.especialidades.set(e));

    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());

    this.especialidadCtrl.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const text = (this.searchCtrl.value ?? '').toLowerCase();
    const espId = this.especialidadCtrl.value;

    this.filtered.set(this.medicos().filter(m => {
      const matchText = !text ||
        m.nombre.toLowerCase().includes(text) ||
        m.apellido.toLowerCase().includes(text) ||
        m.especialidad.nombre.toLowerCase().includes(text);
      const matchEsp = !espId || m.especialidad.id === espId;
      return matchText && matchEsp;
    }));
  }

  initials(m: Medico): string {
    return `${m.nombre[0]}${m.apellido[0]}`.toUpperCase();
  }
}
