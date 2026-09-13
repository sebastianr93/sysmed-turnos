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

      <div class="auth-bg">
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80&auto=format&fit=crop"
             alt="Clínica" class="bg-image" />
        <div class="bg-overlay"></div>
      </div>

      <mat-card class="auth-card">
        <mat-card-header>
          <div class="auth-logo">
            <mat-icon>local_hospital</mat-icon>
            <h1>SysMed</h1>
          </div>
          <mat-card-title>Crear Cuenta</mat-card-title>
          <mat-card-subtitle>Complete sus datos para registrarse como paciente</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper linear #stepper>

            <mat-step [stepControl]="personalForm" label="Datos Personales">
              <form [formGroup]="personalForm" class="step-form">

                <div class="row-2">
                  <div class="input-wrap">
                    <label class="field-label">Nombre *</label>
                    <input class="field-input" formControlName="nombre" placeholder="Ingrese su nombre">
                    @if (personalForm.get('nombre')?.invalid && personalForm.get('nombre')?.touched) {
                      <span class="field-error">Nombre requerido</span>
                    }
                  </div>
                  <div class="input-wrap">
                    <label class="field-label">Apellido *</label>
                    <input class="field-input" formControlName="apellido" placeholder="Ingrese su apellido">
                    @if (personalForm.get('apellido')?.invalid && personalForm.get('apellido')?.touched) {
                      <span class="field-error">Apellido requerido</span>
                    }
                  </div>
                </div>

                <div class="input-wrap">
                  <label class="field-label">Fecha de Nacimiento</label>
                  <mat-form-field appearance="outline" class="full-width no-margin">
                    <input matInput [matDatepicker]="picker" formControlName="fechaNacimiento">
                    <mat-datepicker-toggle matIconSuffix [for]="picker" />
                    <mat-datepicker #picker />
                  </mat-form-field>
                </div>

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

            <mat-step [stepControl]="credForm" label="Credenciales">
              <form [formGroup]="credForm" class="step-form">

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <mat-icon matPrefix>email</mat-icon>
                  <input matInput type="email" formControlName="email">
                  @if (credForm.get('email')?.hasError('email') && credForm.get('email')?.touched) {
                    <mat-error>Email no válido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <mat-icon matPrefix>lock</mat-icon>
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
      padding: 24px;
      position: relative;
    }

    .auth-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(6px) brightness(0.6);
      transform: scale(1.05);
    }

    .bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(26,35,126,0.75) 0%, rgba(57,73,171,0.65) 100%);
    }

    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 520px;
      border-radius: 16px !important;
      box-shadow: 0 24px 48px rgba(0,0,0,0.4) !important;
      background: rgba(255,255,255,0.97) !important;
      --mdc-elevated-card-container-color: rgba(255,255,255,0.97);
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #1a237e; }
      h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1a237e; }
    }

    mat-card-header { padding: 24px 24px 0; }
    mat-card-content { padding: 16px 24px; }
    mat-card-actions { padding: 0 24px 16px; }

    .step-form { padding-top: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .no-margin { margin-bottom: 0; }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    /* Custom native inputs for Nombre, Apellido - evita problemas del stepper con outline */
    .input-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    .field-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #555;
      padding-left: 2px;
    }

    .field-input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid rgba(0,0,0,0.38);
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
      color: #1a1a2e;
      background: white;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
      &:focus {
        border-color: #1a237e;
        border-width: 2px;
      }
      &::placeholder { color: #999; }
    }

    .field-error {
      font-size: 0.75rem;
      color: #c62828;
      padding-left: 2px;
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      border-radius: 8px;
      color: #c62828;
      margin-bottom: 12px;
    }

    .auth-link {
      text-align: center;
      width: 100%;
      margin: 0;
      color: #666;
    }
  `]
})
export class RegisterComponent {
  hidePass = signal(true);
  loading  = signal(false);
  errorMsg = signal('');

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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.personalForm.invalid || this.credForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const pv = this.personalForm.value;
    const cv = this.credForm.value;

    const request = {
      nombre:          pv.nombre!,
      apellido:        pv.apellido!,
      email:           cv.email!,
      password:        cv.password!,
      telefono:        pv.telefono   || undefined,
      obraSocial:      pv.obraSocial || undefined,
      fechaNacimiento: pv.fechaNacimiento
        ? (pv.fechaNacimiento as Date).toISOString().split('T')[0]
        : undefined
    };

    this.auth.register(request).subscribe({
      next:     () => this.router.navigate(['/dashboard']),
      error:    (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Error al registrarse');
      },
      complete: () => this.loading.set(false)
    });
  }
}
