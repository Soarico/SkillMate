import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { forkJoin, Observable, tap } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import {
  ExchangeOffer,
  LearningSession,
  Review,
  SkillGroup,
  UserProfile,
} from '../models/skillmate.models';
import { SkillmateApiService } from '../services/skillmate-api.service';
import { calculateCompatibility, calculateProgressPercent } from '../../shared/utils/compatibility.util';

export type PartnerSort = 'compatibility' | 'rating' | 'name';

interface SkillmateState {
  currentProfile: UserProfile | null;
  partners: UserProfile[];
  sessions: LearningSession[];
  groups: SkillGroup[];
  reviews: Review[];
  query: string;
  category: string;
  sortBy: PartnerSort;
  loading: boolean;
  error: string | null;
}

const initialState: SkillmateState = {
  currentProfile: null,
  partners: [],
  sessions: [],
  groups: [],
  reviews: [],
  query: '',
  category: 'all',
  sortBy: 'compatibility',
  loading: false,
  error: null,
};

export const SkillmateStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    categories: computed(() => {
      const categories = store.partners().flatMap((partner) =>
        partner.teachSkills.map((skill) => skill.category),
      );

      return Array.from(new Set(categories)).sort();
    }),
    filteredPartners: computed(() => {
      const query = store.query().trim().toLowerCase();
      const category = store.category();
      const currentProfile = store.currentProfile();
      const matches = store.partners().map((partner) => calculateCompatibility(currentProfile, partner));

      return matches
        .filter((partner) => partner.id !== currentProfile?.id)
        .filter((partner) => {
          const haystack = [
            partner.name,
            partner.city,
            partner.about,
            ...partner.teachSkills.map((skill) => skill.name),
            ...partner.learnSkills.map((skill) => skill.name),
          ]
            .join(' ')
            .toLowerCase();
          const categoryMatches =
            category === 'all' || partner.teachSkills.some((skill) => skill.category === category);

          return haystack.includes(query) && categoryMatches;
        })
        .sort((first, second) => {
          switch (store.sortBy()) {
            case 'rating':
              return second.rating - first.rating;
            case 'name':
              return first.name.localeCompare(second.name);
            default:
              return second.compatibility - first.compatibility;
          }
        });
    }),
    averageProgress: computed(() => {
      const progress = store.currentProfile()?.progress ?? [];

      if (!progress.length) {
        return 0;
      }

      const total = progress.reduce(
        (sum, item) => sum + calculateProgressPercent(item.completedLessons, item.totalLessons),
        0,
      );

      return Math.round(total / progress.length);
    }),
    upcomingSessions: computed(() =>
      store
        .sessions()
        .filter((session) => session.status === 'planned')
        .sort((first, second) => first.startsAt.localeCompare(second.startsAt)),
    ),
  })),
  withMethods((store, api = inject(SkillmateApiService), auth = inject(AuthService)) => ({
    loadWorkspace(): void {
      const userId = auth.session()?.user.id;

      if (!userId) {
        return;
      }

      patchState(store, { loading: true, error: null });

      forkJoin({
        currentProfile: api.getUser(userId),
        partners: api.getUsers(),
        sessions: api.getSessionsForUser(userId),
        groups: api.getGroups(),
        reviews: api.getReviews(),
      }).subscribe({
        next: (state) => {
          auth.updateCurrentUser(state.currentProfile);
          patchState(store, { ...state, loading: false });
        },
        error: (error: Error) => patchState(store, { loading: false, error: error.message }),
      });
    },
    updateSearch(query: string): void {
      patchState(store, { query });
    },
    updateCategory(category: string): void {
      patchState(store, { category });
    },
    updateSort(sortBy: PartnerSort): void {
      patchState(store, { sortBy });
    },
    saveProfile(profile: UserProfile): Observable<UserProfile> {
      patchState(store, { loading: true, error: null });

      return api.updateProfile(profile.id, profile).pipe(
        tap({
          next: (updatedProfile) => {
            auth.updateCurrentUser(updatedProfile);
            patchState(store, {
              currentProfile: updatedProfile,
              partners: store
                .partners()
                .map((partner) => (partner.id === updatedProfile.id ? updatedProfile : partner)),
              loading: false,
            });
          },
          error: (error: Error) => patchState(store, { loading: false, error: error.message }),
        }),
      );
    },
    proposeExchange(partner: UserProfile): Observable<ExchangeOffer> {
      const currentProfile = store.currentProfile();

      if (!currentProfile) {
        throw new Error('Профиль не загружен');
      }

      const teachSkill = currentProfile.teachSkills.at(0)?.name ?? 'консультация';
      const learnSkill = partner.teachSkills.at(0)?.name ?? 'новый навык';
      const offer: ExchangeOffer = {
        fromUserId: currentProfile.id,
        toUserId: partner.id,
        teachSkill,
        learnSkill,
        message: `Привет! Предлагаю обмен: я помогу с ${teachSkill}, а ты покажешь ${learnSkill}.`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      return api.createOffer(offer);
    },
    scheduleSession(session: LearningSession): Observable<LearningSession> {
      patchState(store, { loading: true, error: null });

      return api.createSession(session).pipe(
        tap({
          next: (createdSession) =>
            patchState(store, { sessions: [...store.sessions(), createdSession], loading: false }),
          error: (error: Error) => patchState(store, { loading: false, error: error.message }),
        }),
      );
    },
    removeSession(sessionId: number): Observable<void> {
      patchState(store, { loading: true, error: null });

      return api.deleteSession(sessionId).pipe(
        tap({
          next: () =>
            patchState(store, {
              sessions: store.sessions().filter((session) => session.id !== sessionId),
              loading: false,
            }),
          error: (error: Error) => patchState(store, { loading: false, error: error.message }),
        }),
      );
    },
    createGroup(group: SkillGroup): Observable<SkillGroup> {
      patchState(store, { loading: true, error: null });

      return api.createGroup(group).pipe(
        tap({
          next: (createdGroup) =>
            patchState(store, { groups: [...store.groups(), createdGroup], loading: false }),
          error: (error: Error) => patchState(store, { loading: false, error: error.message }),
        }),
      );
    },
    addMaterial(group: SkillGroup, materialTitle: string, materialUrl: string): Observable<SkillGroup> {
      const currentProfile = store.currentProfile();

      if (!currentProfile) {
        throw new Error('Профиль не загружен');
      }

      return api
        .addMaterial(group, {
          title: materialTitle,
          url: materialUrl,
          type: 'article',
          authorId: currentProfile.id,
          createdAt: new Date().toISOString(),
        })
        .pipe(
          tap((updatedGroup) =>
            patchState(store, {
              groups: store.groups().map((item) => (item.id === updatedGroup.id ? updatedGroup : item)),
            }),
          ),
        );
    },
    addReview(partnerId: number, rating: number, text: string): Observable<Review> {
      const currentProfile = store.currentProfile();

      if (!currentProfile) {
        throw new Error('Профиль не загружен');
      }

      return api
        .createReview({
          authorId: currentProfile.id,
          partnerId,
          rating,
          text,
          createdAt: new Date().toISOString(),
        })
        .pipe(tap((review) => patchState(store, { reviews: [...store.reviews(), review] })));
    },
  })),
);
