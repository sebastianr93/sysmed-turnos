import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: Rol[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">

      <!-- Sidebar -->
      <mat-sidenav mode="side" opened class="sidenav">
        <!-- Logo -->
        <div class="sidenav-header">
          <mat-icon class="logo-icon">local_hospital</mat-icon>
          <span class="logo-text">MedSystem</span>
        </div>

        <mat-divider />

        <!-- User info -->
        <div class="user-info">
          <div class="avatar">{{ initials() }}</div>
          <div class="user-details">
            <span class="user-name">{{ auth.userFullName() }}</span>
            <span class="user-role">{{ rolLabel() }}</span>
          </div>
        </div>

        <mat-divider />

        <!-- Nav links -->
        <mat-nav-list>
          @for (item of visibleNavItems(); track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link"
               [matTooltip]="item.label"
               matTooltipPosition="right">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider />
          <button mat-list-item (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        <!-- Top Toolbar -->
        <mat-toolbar color="primary" class="top-toolbar">
          <span class="toolbar-spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="menu-user-info">
              <p class="menu-name">{{ auth.userFullName() }}</p>
              <p class="menu-email">{{ auth.currentUser()?.email }}</p>
            </div>
            <mat-divider />
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar sesión</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="page-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 240px;
      background: #1a237e;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      .logo-icon { color: #90caf9; font-size: 32px; width: 32px; height: 32px; }
      .logo-text { font-size: 1.25rem; font-weight: 700; color: white; }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      .avatar {
        width: 38px; height: 38px; border-radius: 50%;
        background: #3949ab; color: white;
        display: flex; align-items: center; justify-content: center;
        font-weight: 600; font-size: 0.9rem;
      }
      .user-name { display: block; font-size: 0.85rem; font-weight: 600; color: white; }
      .user-role { display: block; font-size: 0.75rem; color: #90caf9; }
    }

    mat-nav-list {
      flex: 1;
      padding-top: 8px;
      a {
        color: rgba(255,255,255,0.8);
        border-radius: 8px;
        margin: 2px 8px;
        &:hover { background: rgba(255,255,255,0.1); color: white; }
        &.active-link { background: rgba(255,255,255,0.2); color: white; font-weight: 600; }
        mat-icon { color: #90caf9; }
      }
    }

    .sidenav-footer {
      padding: 8px;
      .logout-btn {
        width: 100%; color: rgba(255,255,255,0.7); cursor: pointer;
        background: none; border: none;
        display: flex; align-items: center; gap: 8px;
        padding: 12px 16px; border-radius: 8px;
        &:hover { background: rgba(255,255,255,0.1); color: white; }
      }
    }

    .top-toolbar {
      position: sticky; top: 0; z-index: 100;
      .toolbar-spacer { flex: 1; }
    }

    .main-content { display: flex; flex-direction: column; }

    .page-content { padding: 24px; flex: 1; }

    .menu-user-info {
      padding: 12px 16px;
      .menu-name { font-weight: 600; margin: 0 0 4px; }
      .menu-email { font-size: 0.8rem; color: #666; margin: 0; }
    }
  `]
})
export class LayoutComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard',      icon: 'dashboard',        route: '/dashboard',           roles: [Rol.ADMIN, Rol.MEDICO, Rol.PACIENTE] },
    { label: 'Médicos',        icon: 'medical_services', route: '/medicos',             roles: [Rol.ADMIN, Rol.MEDICO, Rol.PACIENTE] },
    { label: 'Reservar Turno', icon: 'event_available',  route: '/turnos/reservar',     roles: [Rol.PACIENTE] },
    { label: 'Mis Turnos',     icon: 'event_note',       route: '/turnos/mis-turnos',   roles: [Rol.PACIENTE] },
    { label: 'Mi Agenda',      icon: 'calendar_month',   route: '/turnos/agenda',       roles: [Rol.MEDICO] },
    { label: 'Gestión Médicos',icon: 'manage_accounts',  route: '/admin/medicos',       roles: [Rol.ADMIN] },
    { label: 'Especialidades', icon: 'category',         route: '/admin/especialidades',roles: [Rol.ADMIN] },
    { label: 'Todos los Turnos',icon: 'list_alt',        route: '/admin/turnos',        roles: [Rol.ADMIN] },
  ];

  visibleNavItems = computed(() => {
    const rol = this.auth.currentUser()?.rol;
    return rol ? this.navItems.filter(i => i.roles.includes(rol)) : [];
  });

  initials = computed(() => {
    const u = this.auth.currentUser();
    return u ? `${u.nombre[0]}${u.apellido[0]}`.toUpperCase() : '?';
  });

  rolLabel = computed(() => {
    const map: Record<Rol, string> = { ADMIN: 'Administrador', MEDICO: 'Médico', PACIENTE: 'Paciente' };
    const rol = this.auth.currentUser()?.rol;
    return rol ? map[rol] : '';
  });

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void { this.auth.logout(); }
}
