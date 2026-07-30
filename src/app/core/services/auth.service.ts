import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role, User } from '../models/user.model';

const TOKEN_KEY = 'betacomics_token';
const USER_KEY = 'betacomics_user';

interface StoredSession {
  username: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  // Stato reattivo dell'utente corrente (null = non autenticato)
  private readonly sessionSignal = signal<StoredSession | null>(this.loadStoredSession());

  readonly currentUser = computed(() => this.sessionSignal());
  readonly isLoggedIn = computed(() => this.sessionSignal() !== null);
  readonly isAdmin = computed(() => this.normalizeRole(this.sessionSignal()?.role) === 'ADMIN');

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, request).pipe(
      tap((res) => this.persistSession(res)),
    );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.sessionSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(res: AuthResponse): void {
    const role = this.normalizeRole(res.role) as Role;
    const session: StoredSession = { username: res.username, role };
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  private loadStoredSession(): StoredSession | null {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !token) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }

  // Il backend puo' restituire l'authority come "ROLE_ADMIN" o "ADMIN": normalizziamo.
  private normalizeRole(role: string | undefined): string {
    if (!role) return '';
    return role.replace('ROLE_', '');
  }
}
