import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, Rol } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'medical_token';
  private readonly USER_KEY  = 'medical_user';

  private _currentUser = signal<AuthResponse | null>(this.loadUserFromStorage());

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isAdmin      = computed(() => this._currentUser()?.rol === Rol.ADMIN);
  readonly isMedico     = computed(() => this._currentUser()?.rol === Rol.MEDICO);
  readonly isPaciente   = computed(() => this._currentUser()?.rol === Rol.PACIENTE);
  readonly userFullName = computed(() => {
    const u = this._currentUser();
    return u ? `${u.nombre} ${u.apellido}` : '';
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(resp => this.storeSession(resp)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap(resp => this.storeSession(resp)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this._currentUser.set(response);
  }

  private loadUserFromStorage(): AuthResponse | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
