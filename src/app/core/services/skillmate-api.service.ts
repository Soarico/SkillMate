import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import {
  ExchangeOffer,
  LearningSession,
  Review,
  SkillGroup,
  StudyMaterial,
  UserProfile,
  UserRecord,
} from '../models/skillmate.models';
import { MOCK_SKILLMATE_DATA, MockSkillmateData } from './mock-skillmate-data';
import { StorageService } from './storage.service';

const STATIC_DEMO_DATA_KEY = 'skillmate.static-demo-data';

@Injectable({ providedIn: 'root' })
export class SkillmateApiService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly baseUrl = '/api';
  private readonly useStaticDemoApi =
    typeof location !== 'undefined' && location.hostname.endsWith('github.io');

  getUsers(): Observable<UserProfile[]> {
    if (this.useStaticDemoApi) {
      return this.fromStaticDemo((data) => data.users.map((user) => this.toProfile(user)));
    }

    return this.http.get<UserProfile[]>(`${this.baseUrl}/users`);
  }

  getUser(id: number): Observable<UserProfile> {
    if (this.useStaticDemoApi) {
      return this.fromStaticDemo((data) => {
        const user = data.users.find((item) => Number(item.id) === Number(id));

        if (!user) {
          throw new Error('Пользователь не найден');
        }

        return this.toProfile(user);
      });
    }

    return this.http.get<UserProfile>(`${this.baseUrl}/users/${id}`);
  }

  findUserByEmail(email: string): Observable<UserRecord[]> {
    if (this.useStaticDemoApi) {
      const normalizedEmail = email.trim().toLowerCase();

      return this.fromStaticDemo((data) =>
        data.users.filter((user) => user.email.toLowerCase() === normalizedEmail),
      );
    }

    const params = new HttpParams().set('email', email);

    return this.http.get<UserRecord[]>(`${this.baseUrl}/users`, { params });
  }

  updateProfile(id: number, profile: Partial<UserProfile>): Observable<UserProfile> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const index = data.users.findIndex((user) => Number(user.id) === Number(id));

        if (index < 0) {
          throw new Error('Пользователь не найден');
        }

        data.users[index] = { ...data.users[index], ...profile };

        return this.toProfile(data.users[index]);
      });
    }

    return this.http.patch<UserProfile>(`${this.baseUrl}/users/${id}`, profile);
  }

  createUser(user: Omit<UserRecord, 'id'>): Observable<UserRecord> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const createdUser = { ...user, id: this.nextId(data.users) };
        data.users.push(createdUser);

        return createdUser;
      });
    }

    return this.http.post<UserRecord>(`${this.baseUrl}/users`, user);
  }

  getSessionsForUser(userId: number): Observable<LearningSession[]> {
    if (this.useStaticDemoApi) {
      return this.fromStaticDemo((data) =>
        data.sessions.filter((session) => Number(session.hostId) === Number(userId)),
      );
    }

    return this.http.get<LearningSession[]>(`${this.baseUrl}/sessions`, {
      params: new HttpParams().set('hostId', userId),
    });
  }

  createSession(session: LearningSession): Observable<LearningSession> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const createdSession = { ...session, id: this.nextId(data.sessions) };
        data.sessions.push(createdSession);

        return createdSession;
      });
    }

    return this.http.post<LearningSession>(`${this.baseUrl}/sessions`, session);
  }

  deleteSession(id: number): Observable<void> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        data.sessions = data.sessions.filter((session) => Number(session.id) !== Number(id));
      });
    }

    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  createOffer(offer: ExchangeOffer): Observable<ExchangeOffer> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const createdOffer = { ...offer, id: this.nextId(data.offers) };
        data.offers.push(createdOffer);

        return createdOffer;
      });
    }

    return this.http.post<ExchangeOffer>(`${this.baseUrl}/offers`, offer);
  }

  getReviews(): Observable<Review[]> {
    if (this.useStaticDemoApi) {
      return this.fromStaticDemo((data) => data.reviews);
    }

    return this.http.get<Review[]>(`${this.baseUrl}/reviews`);
  }

  createReview(review: Review): Observable<Review> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const createdReview = { ...review, id: this.nextId(data.reviews) };
        data.reviews.push(createdReview);

        return createdReview;
      });
    }

    return this.http.post<Review>(`${this.baseUrl}/reviews`, review);
  }

  getGroups(): Observable<SkillGroup[]> {
    if (this.useStaticDemoApi) {
      return this.fromStaticDemo((data) => data.groups);
    }

    return this.http.get<SkillGroup[]>(`${this.baseUrl}/groups`);
  }

  createGroup(group: SkillGroup): Observable<SkillGroup> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const createdGroup = { ...group, id: this.nextId(data.groups) };
        data.groups.push(createdGroup);

        return createdGroup;
      });
    }

    return this.http.post<SkillGroup>(`${this.baseUrl}/groups`, group);
  }

  deleteGroup(id: number): Observable<void> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        data.groups = data.groups.filter((group) => Number(group.id) !== Number(id));
      });
    }

    return this.http.delete<void>(`${this.baseUrl}/groups/${id}`);
  }

  updateGroup(id: number, group: Partial<SkillGroup>): Observable<SkillGroup> {
    if (this.useStaticDemoApi) {
      return this.updateStaticDemo((data) => {
        const index = data.groups.findIndex((item) => Number(item.id) === Number(id));

        if (index < 0) {
          throw new Error('Группа не найдена');
        }

        data.groups[index] = { ...data.groups[index], ...group };

        return data.groups[index];
      });
    }

    return this.http.patch<SkillGroup>(`${this.baseUrl}/groups/${id}`, group);
  }

  addMaterial(group: SkillGroup, material: StudyMaterial): Observable<SkillGroup> {
    const materials = [...group.materials, material];

    return this.updateGroup(Number(group.id), { materials });
  }

  private fromStaticDemo<T>(selector: (data: MockSkillmateData) => T): Observable<T> {
    try {
      return of(this.clone(selector(this.readStaticDemoData())));
    } catch (error) {
      return throwError(() => error);
    }
  }

  private updateStaticDemo<T>(updater: (data: MockSkillmateData) => T): Observable<T> {
    try {
      const data = this.readStaticDemoData();
      const result = updater(data);
      this.writeStaticDemoData(data);

      return of(this.clone(result));
    } catch (error) {
      return throwError(() => error);
    }
  }

  private readStaticDemoData(): MockSkillmateData {
    const storedData = this.storage.getItem(STATIC_DEMO_DATA_KEY);

    if (!storedData) {
      return this.clone(MOCK_SKILLMATE_DATA);
    }

    try {
      return JSON.parse(storedData) as MockSkillmateData;
    } catch {
      this.storage.removeItem(STATIC_DEMO_DATA_KEY);

      return this.clone(MOCK_SKILLMATE_DATA);
    }
  }

  private writeStaticDemoData(data: MockSkillmateData): void {
    this.storage.setItem(STATIC_DEMO_DATA_KEY, JSON.stringify(data));
  }

  private nextId(items: Array<{ id?: number }>): number {
    return Math.max(0, ...items.map((item) => Number(item.id ?? 0))) + 1;
  }

  private toProfile(user: UserRecord): UserProfile {
    return {
      id: Number(user.id),
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
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
