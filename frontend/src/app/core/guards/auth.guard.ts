import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (roles: Rol[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  if (user && roles.includes(user.rol)) return true;
  router.navigate(['/dashboard']);
  return false;
};

export const publicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  router.navigate(['/dashboard']);
  return false;
};
