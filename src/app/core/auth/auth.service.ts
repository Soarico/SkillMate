import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

import { AuthSession, LoginCredentials, UserProfile } from '../models/skillmate.models';
import { SkillmateApiService } from '../services/skillmate-api.service';
import { StorageService } from '../services/storage.service';

const SESSION_KEY = 'skillmate.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(SkillmateApiService);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly sessionState = signal<AuthSession | null>(this.restoreSession());

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.token));

  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.api.findUserByEmail(credentials.email).pipe(
      map((users) => {
        const user = users.at(0);

        if (!user || user.password !== credentials.password) {
          throw new Error('Неверный email или пароль');
        }

        const profile: UserProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          city: user.city,
          avatarUrl: user.avatarUrl,
          about: user.about,
          teachSkills: user.teachSkills,
          learnSkills: user.learnSkills,
          interests: user.interests,
          progress: user.progress,
          rating: user.rating,
          reviewCount: user.reviewCount,
        };

        return {
          token: `mock-jwt-${profile.id}-${Date.now()}`,
          user: profile,
        };
      }),
      tap((session) => this.persistSession(session)),
    );
  }

  updateCurrentUser(user: UserProfile): void {
    const current = this.sessionState();

    if (!current) {
      return;
    }

    this.persistSession({ ...current, user });
  }

  token(): string | null {
    return this.sessionState()?.token ?? null;
  }

  logout(): void {
    this.storage.removeItem(SESSION_KEY);
    this.sessionState.set(null);
    void this.router.navigate(['/login']);
  }

  private persistSession(session: AuthSession): void {
    this.storage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private restoreSession(): AuthSession | null {
    const rawSession = this.storage.getItem(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      this.storage.removeItem(SESSION_KEY);

      return null;
    }
  }
}
