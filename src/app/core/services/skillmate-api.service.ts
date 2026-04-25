import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ExchangeOffer,
  LearningSession,
  Review,
  SkillGroup,
  StudyMaterial,
  UserProfile,
  UserRecord,
} from '../models/skillmate.models';

@Injectable({ providedIn: 'root' })
export class SkillmateApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.baseUrl}/users`);
  }

  getUser(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/${id}`);
  }

  findUserByEmail(email: string): Observable<UserRecord[]> {
    const params = new HttpParams().set('email', email);

    return this.http.get<UserRecord[]>(`${this.baseUrl}/users`, { params });
  }

  updateProfile(id: number, profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/users/${id}`, profile);
  }

  getSessionsForUser(userId: number): Observable<LearningSession[]> {
    return this.http.get<LearningSession[]>(`${this.baseUrl}/sessions`, {
      params: new HttpParams().set('hostId', userId),
    });
  }

  createSession(session: LearningSession): Observable<LearningSession> {
    return this.http.post<LearningSession>(`${this.baseUrl}/sessions`, session);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  createOffer(offer: ExchangeOffer): Observable<ExchangeOffer> {
    return this.http.post<ExchangeOffer>(`${this.baseUrl}/offers`, offer);
  }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews`);
  }

  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, review);
  }

  getGroups(): Observable<SkillGroup[]> {
    return this.http.get<SkillGroup[]>(`${this.baseUrl}/groups`);
  }

  createGroup(group: SkillGroup): Observable<SkillGroup> {
    return this.http.post<SkillGroup>(`${this.baseUrl}/groups`, group);
  }

  addMaterial(group: SkillGroup, material: StudyMaterial): Observable<SkillGroup> {
    const materials = [...group.materials, material];

    return this.http.patch<SkillGroup>(`${this.baseUrl}/groups/${group.id}`, { materials });
  }
}
