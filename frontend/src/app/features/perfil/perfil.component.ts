import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTabsModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule, MatDividerModule
  ],
  template: `
    <div class="perfil-container">

      <!-- Header -->
      <div class="perfil-header">
        <div class="avatar-grande">{{ iniciales() }}</div>
        <div class="header-info">
          <h1>{{ auth.userFullName() }}</h1>
          <span class="rol-badge">{{ rolLabel() }}</span>
          <p class="email">{{ auth.currentUser()?.email }}</p>
        </div>
        <button mat-icon-button class="back-btn" (click)="router.navigate(['/dashboard'])"
                matTooltip="Volver al dashboard">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>

      <!-- Tabs -->
      <mat-tab-group animationDuration="200ms">

        <!-- Tab 1: Datos personales -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>person</mat-icon>
            <span style="margin-left:8px">Datos Personales</span>
          </ng-template>

          <mat-card class="tab-card">
            <mat-card-content>
              <form [formGroup]="perfilForm" (ngSubmit)="guardarPerfil()">

                <h3 class="section-title">Información general</h3>

                <div class="row-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre</mat-label>
                    <input matInput formControlName="nombre">
                    <mat-icon matPrefix>badge</mat-icon>
                    @if (perfilForm.get('nombre')?.invalid && perfilForm.get('nombre')?.touched) {
                      <mat-error>El nombre es requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Apellido</mat-label>
                    <input matInput formControlName="apellido">
                    <mat-icon matPrefix>badge</mat-icon>
                    @if (perfilForm.get('apellido')?.invalid && perfilForm.get('apellido')?.touched) {
                      <mat-error>El apellido es requerido</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput [value]="auth.currentUser()?.email ?? ''" readonly>
                  <mat-icon matPrefix>email</mat-icon>
                  <mat-hint>El email no puede modificarse</mat-hint>
                </mat-form-field>

                @if (esPaciente()) {
                  <mat-divider style="margin: 16px 0" />
                  <h3 class="section-title">Información de paciente</h3>

                  <div class="row-2">
                    <mat-form-field appearance="outline">
                      <mat-label>Teléfono</mat-label>
                      <input matInput formControlName="telefono" placeholder="011-1234-5678">
                      <mat-icon matPrefix>phone</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Fecha de Nacimiento</mat-label>
                      <input matInput [matDatepicker]="picker" formControlName="fechaNacimiento">
                      <mat-datepicker-toggle matIconSuffix [for]="picker" />
                      <mat-datepicker #picker />
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Obra Social</mat-label>
                    <input matInput formControlName="obraSocial">
                    <mat-icon matPrefix>health_and_safety</mat-icon>
                  </mat-form-field>
                }

                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit"
                          [disabled]="perfilForm.invalid || savingPerfil()">
                    @if (savingPerfil()) {
                      <mat-spinner diameter="20" />
                    } @else {
                      <ng-container>
                        <mat-icon>save</mat-icon> Guardar cambios
                      </ng-container>
                    }
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Tab 2: Cambiar contraseña -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>lock</mat-icon>
            <span style="margin-left:8px">Contraseña</span>
          </ng-template>

          <mat-card class="tab-card">
            <mat-card-content>
              <form [formGroup]="passwordForm" (ngSubmit)="cambiarPassword()">

                <h3 class="section-title">Cambiar contraseña</h3>
                <p class="section-subtitle">Por seguridad, necesitás ingresar tu contraseña actual</p>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña actual</mat-label>
                  <input matInput [type]="hideActual() ? 'password' : 'text'"
                         formControlName="passwordActual">
                  <mat-icon matPrefix>lock_open</mat-icon>
                  <button mat-icon-button matSuffix type="button"
                          (click)="hideActual.set(!hideActual())">
                    <mat-icon>{{ hideActual() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (passwordForm.get('passwordActual')?.invalid && passwordForm.get('passwordActual')?.touched) {
                    <mat-error>La contraseña actual es requerida</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nueva contraseña</mat-label>
                  <input matInput [type]="hideNueva() ? 'password' : 'text'"
                         formControlName="passwordNueva">
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button"
                          (click)="hideNueva.set(!hideNueva())">
                    <mat-icon>{{ hideNueva() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (passwordForm.get('passwordNueva')?.hasError('minlength') && passwordForm.get('passwordNueva')?.touched) {
                    <mat-error>Mínimo 6 caracteres</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirmar nueva contraseña</mat-label>
                  <input matInput [type]="hideConfirm() ? 'password' : 'text'"
                         formControlName="passwordConfirmacion">
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button"
                          (click)="hideConfirm.set(!hideConfirm())">
                    <mat-icon>{{ hideConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (passwordForm.hasError('noCoinciden') && passwordForm.get('passwordConfirmacion')?.touched) {
                    <mat-error>Las contraseñas no coinciden</mat-error>
                  }
                </mat-form-field>

                @if (errorPassword()) {
                  <div class="error-alert">
                    <mat-icon>error_outline</mat-icon>
                    <span>{{ errorPassword() }}</span>
                  </div>
                }

                <div class="form-actions">
                  <button mat-raised-button color="primary" type="submit"
                          [disabled]="passwordForm.invalid || savingPassword()">
                    @if (savingPassword()) {
                      <mat-spinner diameter="20" />
                    } @else {
                      <ng-container>
                        <mat-icon>lock_reset</mat-icon> Cambiar contraseña
                      </ng-container>
                    }
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .perfil-container { max-width: 800px; margin: 0 auto; }

    .perfil-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      position: relative;
    }

    .back-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      color: #666;
    }

    .avatar-grande {
      width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #1a237e, #3949ab);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 700; color: white;
    }

    .header-info {
      flex: 1;
      h1 { margin: 0 0 6px; font-size: 1.5rem; color: #1a237e; }
      .email { margin: 6px 0 0; color: #666; font-size: 0.9rem; }
    }

    .rol-badge {
      display: inline-block;
      padding: 3px 12px;
      background: #e8eaf6;
      color: #3949ab;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .tab-card {
      border-radius: 12px !important;
      margin-top: 16px;
    }

    mat-card-content { padding: 24px !important; }

    .section-title {
      color: #1a237e;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .section-subtitle {
      color: #666;
      font-size: 0.85rem;
      margin: -8px 0 20px;
    }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 8px;
    }

    .full-width { width: 100%; margin-bottom: 8px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
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
      margin-bottom: 16px;
      mat-icon { font-size: 20px; }
    }

    @media (max-width: 600px) {
      .row-2 { grid-template-columns: 1fr; }
      .perfil-header { flex-direction: column; text-align: center; }
      .back-btn { top: 8px; right: 8px; }
    }
  `]
})
export class PerfilComponent implements OnInit {
  savingPerfil  = signal(false);
  savingPassword = signal(false);
  errorPassword  = signal('');
  hideActual  = signal(true);
  hideNueva   = signal(true);
  hideConfirm = signal(true);

  perfilForm = this.fb.group({
    nombre:          ['', Validators.required],
    apellido:        ['', Validators.required],
    telefono:        [''],
    fechaNacimiento: [null as Date | null],
    obraSocial:      ['']
  });

  passwordForm = this.fb.group({
    passwordActual:       ['', Validators.required],
    passwordNueva:        ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmacion: ['', Validators.required]
  }, { validators: this.passwordsCoinciden });

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.http.get<any>(`${environment.apiUrl}/usuarios/perfil`).subscribe({
      next: (usuario) => {
        this.perfilForm.patchValue({
          nombre:   usuario.nombre,
          apellido: usuario.apellido
        });
      }
    });
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) return;
    this.savingPerfil.set(true);

    const raw = this.perfilForm.value;
    const body = {
      nombre:          raw.nombre,
      apellido:        raw.apellido,
      telefono:        raw.telefono || null,
      obraSocial:      raw.obraSocial || null,
      fechaNacimiento: raw.fechaNacimiento
        ? (raw.fechaNacimiento as Date).toISOString().split('T')[0]
        : null
    };

    this.http.put<any>(`${environment.apiUrl}/usuarios/perfil`, body).subscribe({
      next: (usuario) => {
        this.savingPerfil.set(false);
        const current = this.auth.currentUser();
        if (current) {
          localStorage.setItem('medical_user', JSON.stringify({
            ...current,
            nombre:   usuario.nombre,
            apellido: usuario.apellido
          }));
        }
        this.snackBar.open('✅ Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.savingPerfil.set(false);
        this.snackBar.open(err.error?.message ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    this.errorPassword.set('');

    this.http.put(`${environment.apiUrl}/usuarios/cambiar-password`, this.passwordForm.value)
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordForm.reset();
          this.snackBar.open('✅ Contraseña cambiada correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.savingPassword.set(false);
          this.errorPassword.set(err.error?.message ?? 'Error al cambiar contraseña');
        }
      });
  }

  esPaciente  = () => this.auth.isPaciente();

  iniciales = () => {
    const u = this.auth.currentUser();
    return u ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase() : '?';
  };

  rolLabel = () => {
    const map: Record<string, string> = {
      ADMIN:    'Administrador',
      MEDICO:   'Médico',
      PACIENTE: 'Paciente'
    };
    return map[this.auth.currentUser()?.rol ?? ''] ?? '';
  };

  private passwordsCoinciden(group: any) {
    const nueva        = group.get('passwordNueva')?.value;
    const confirmacion = group.get('passwordConfirmacion')?.value;
    return nueva === confirmacion ? null : { noCoinciden: true };
  }
}
