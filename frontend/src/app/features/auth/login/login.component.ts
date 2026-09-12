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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
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
          <mat-card-title>Iniciar Sesión</mat-card-title>
          <mat-card-subtitle>Ingrese sus credenciales para continuar</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="usuario@ejemplo.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>El email es requerido</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Ingrese un email válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>

            @if (errorMsg()) {
              <div class="error-alert">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMsg() }}</span>
              </div>
            }

            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                <ng-container>
                  <mat-icon>login</mat-icon>
                  Ingresar
                </ng-container>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="auth-link">
            ¿No tiene cuenta?
            <a routerLink="/auth/register" mat-button color="primary">Registrarse</a>
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
      max-width: 440px;
      border-radius: 16px !important;
      box-shadow: 0 24px 48px rgba(0,0,0,0.4) !important;
      background: rgba(255,255,255,0.97) !important;
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

    .full-width { width: 100%; margin-bottom: 12px; }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
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
      mat-icon { font-size: 20px; }
    }

    .auth-link {
      text-align: center;
      width: 100%;
      margin: 0;
      color: #666;
    }
  `]
})
export class LoginComponent {
  hidePassword = signal(true);
  loading = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'Email o contraseña incorrectos');
      },
      complete: () => this.loading.set(false)
    });
  }
}