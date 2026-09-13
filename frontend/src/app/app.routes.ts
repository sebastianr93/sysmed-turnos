import { Routes } from '@angular/router';
import { authGuard, publicGuard, roleGuard } from './core/guards/auth.guard';
import { Rol } from './core/models';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // ── Auth (public) ───────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ── Protected layout ────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'medicos',
        loadComponent: () => import('./features/medicos/list/medicos-list.component').then(m => m.MedicosListComponent)
      },
      {
        path: 'medicos/:id',
        loadComponent: () => import('./features/medicos/detail/medico-detail.component').then(m => m.MedicoDetailComponent)
      },
      {
        path: 'turnos/reservar',
        canActivate: [roleGuard([Rol.PACIENTE])],
        loadComponent: () => import('./features/turnos/reservar/reservar-turno.component').then(m => m.ReservarTurnoComponent)
      },
      {
        path: 'turnos/mis-turnos',
        canActivate: [roleGuard([Rol.PACIENTE])],
        loadComponent: () => import('./features/turnos/mis-turnos/mis-turnos.component').then(m => m.MisTurnosComponent)
      },
      {
        path: 'turnos/agenda',
        canActivate: [roleGuard([Rol.MEDICO])],
        loadComponent: () => import('./features/turnos/agenda/agenda.component').then(m => m.AgendaComponent)
      },
      {
        path: 'admin/medicos',
        canActivate: [roleGuard([Rol.ADMIN])],
        loadComponent: () => import('./features/admin/medicos/admin-medicos.component').then(m => m.AdminMedicosComponent)
      },
      {
        path: 'admin/especialidades',
        canActivate: [roleGuard([Rol.ADMIN])],
        loadComponent: () => import('./features/admin/especialidades/admin-especialidades.component').then(m => m.AdminEspecialidadesComponent)
      },
      {
        path: 'admin/turnos',
        canActivate: [roleGuard([Rol.ADMIN])],
        loadComponent: () => import('./features/admin/turnos/admin-turnos.component').then(m => m.AdminTurnosComponent)
      },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
