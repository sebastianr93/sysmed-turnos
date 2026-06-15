import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule, MatStepperModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>local_hospital</mat-icon>
            <h1>MedSystem</h1>
          </div>
          <mat-card-title>Crear Cuenta</mat-card-title>
          <mat-card-subtitle>Complete sus datos para registrarse como paciente</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper linear #stepper>

            <!-- Step 1: Datos personales -->
            <mat-step [stepControl]="personalForm" label="Datos Personales">
              <form [formGroup]="personalForm">
                <div class="row-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre</mat-label>
                    <input matInput formControlName="nombre">
                    @if (personalForm.get('nombre')?.invalid && personalForm.get('nombre')?.touched) {
                      <mat-error>Nombre requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Apellido</mat-label>
                    <input matInput formControlName="apellido">
                    @if (personalForm.get('apellido')?.invalid && personalForm.get('apellido')?.touched) {
                      <mat-error>Apellido requerido</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Fecha de Nacimiento</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="fechaNacimiento">
                  <mat-datepicker-toggle matIconSuffix [for]="picker" />
                  <mat-datepicker #picker />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Teléfono</mat-label>
                  <input matInput formControlName="telefono" placeholder="011-1234-5678">
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Obra Social</mat-label>
                  <input matInput formControlName="obraSocial" placeholder="OSDE, Swiss Medical, etc.">
                  <mat-icon matPrefix>health_and_safety</mat-icon>
                </mat-form-field>

                <div class="step-actions">
                  <button mat-raised-button color="primary" matStepperNext type="button"
                          [disabled]="personalForm.invalid">
                    Siguiente <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Credenciales -->
            <mat-step [stepControl]="credForm" label="Credenciales">
              <form [formGroup]="credForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email">
                  <mat-icon matPrefix>email</mat-icon>
                  @if (credForm.get('email')?.hasError('email') && credForm.get('email')?.touched) {
                    <mat-error>Email no válido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <input matInput [type]="hidePass() ? 'password' : 'text'" formControlName="password">
                  <button mat-icon-button matSuffix type="button" (click)="hidePass.set(!hidePass())">
                    <mat-icon>{{ hidePass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (credForm.get('password')?.hasError('minlength') && credForm.get('password')?.touched) {
                    <mat-error>Mínimo 6 caracteres</mat-error>
                  }
                </mat-form-field>

                @if (errorMsg()) {
                  <div class="error-alert">
                    <mat-icon>error_outline</mat-icon>
                    <span>{{ errorMsg() }}</span>
                  </div>
                }

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">
                    <mat-icon>arrow_back</mat-icon> Anterior
                  </button>
                  <button mat-raised-button color="primary" type="button"
                          (click)="onSubmit()" [disabled]="loading() || credForm.invalid">
		@if (loading()) { <mat-spinner diameter="20" /> }
                  @else {
                    <ng-container>
                      <mat-icon>check</mat-icon> Registrarme
                    </ng-container>
                  }
                  </button>
                </div>
              </form>
            </mat-step>

          </mat-stepper>
        </mat-card-content>

        <mat-card-actions>
          <p class="auth-link">
            ¿Ya tiene cuenta?
            <a routerLink="/auth/login" mat-button color="primary">Iniciar Sesión</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
      padding: 24px;
    }
    .auth-card { width: 100%; max-width: 520px; border-radius: 16px !important; }
    .auth-logo {
      display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #1a237e; }
      h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1a237e; }
    }
    mat-card-header { padding: 24px 24px 0; }
    mat-card-content { padding: 16px 24px; }
    mat-card-actions { padding: 0 24px 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
    .step-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .error-alert {
      display: flex; align-items: center; gap: 8px;
      padding: 12px; background: #ffebee; border-radius: 8px;
      color: #c62828; margin-bottom: 12px;
    }
    .auth-link { text-align: center; width: 100%; margin: 0; color: #666; }
  `]
})
export class RegisterComponent {
  hidePass = signal(true);
  loading = signal(false);
  errorMsg = signal('');
  maxDate = new Date();

  personalForm = this.fb.group({
    nombre:          ['', Validators.required],
    apellido:        ['', Validators.required],
    fechaNacimiento: [null as Date | null],
    telefono:        [''],
    obraSocial:      ['']
  });

  credForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.personalForm.invalid || this.credForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const pv = this.personalForm.value;
    const cv = this.credForm.value;

    const request = {
      nombre: pv.nombre!,
      apellido: pv.apellido!,
      email: cv.email!,
      password: cv.password!,
      telefono: pv.telefono || undefined,
      fechaNacimiento: pv.fechaNacimiento
        ? (pv.fechaNacimiento as Date).toISOString().split('T')[0]
        : undefined,
      obraSocial: pv.obraSocial || undefined
    };

    this.auth.register(request).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Error al registrarse');
      },
      complete: () => this.loading.set(false)
    });
  }
}
