import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SkillmateApiService } from '../services/skillmate-api.service';
import { StorageService } from '../services/storage.service';
import { AuthService } from './auth.service';
import { UserRecord } from '../models/skillmate.models';

const userRecord: UserRecord = {
  id: 1,
  name: 'Аня',
  email: 'anya@student.test',
  password: 'skillmate',
  city: 'Москва',
  avatarUrl: '',
  about: 'Frontend student',
  teachSkills: [],
  learnSkills: [],
  interests: [],
  progress: [],
  rating: 5,
  reviewCount: 1,
};

describe('AuthService', () => {
  let api: { createUser: jest.Mock; findUserByEmail: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    api = {
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        StorageService,
        { provide: SkillmateApiService, useValue: api },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('logs in and stores a mock token', (done) => {
    api.findUserByEmail.mockReturnValue(of([userRecord]));

    service.login({ email: 'anya@student.test', password: 'skillmate' }).subscribe((session) => {
      expect(session.token).toContain('mock-jwt-1');
      expect(session.user.email).toBe('anya@student.test');
      expect(service.isAuthenticated()).toBe(true);
      done();
    });
  });

  it('rejects invalid credentials', (done) => {
    api.findUserByEmail.mockReturnValue(of([userRecord]));

    service.login({ email: 'anya@student.test', password: 'wrong-password' }).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('Неверный email или пароль');
        expect(service.isAuthenticated()).toBe(false);
        done();
      },
    });
  });

  it('passes API errors to subscribers', (done) => {
    api.findUserByEmail.mockReturnValue(throwError(() => new Error('API unavailable')));

    service.login({ email: 'anya@student.test', password: 'skillmate' }).subscribe({
      error: (error: Error) => {
        expect(error.message).toBe('API unavailable');
        done();
      },
    });
  });

  it('registers a user and starts a session', (done) => {
    api.findUserByEmail.mockReturnValue(of([]));
    api.createUser.mockReturnValue(of({ ...userRecord, id: 5, email: 'new@student.test' }));

    service
      .register({
        name: 'Новый пользователь',
        email: 'New@Student.Test',
        password: 'skillmate',
        city: 'Москва',
        about: 'Хочу обмениваться навыками и учиться вместе.',
      })
      .subscribe((session) => {
        expect(api.createUser).toHaveBeenCalledWith(
          expect.objectContaining({ email: 'new@student.test', password: 'skillmate' }),
        );
        expect(session.token).toContain('mock-jwt-5');
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
  });

  it('rejects registration with an existing email', (done) => {
    api.findUserByEmail.mockReturnValue(of([userRecord]));

    service
      .register({
        name: 'Аня',
        email: 'anya@student.test',
        password: 'skillmate',
        city: 'Москва',
        about: 'Повторная регистрация существующего email.',
      })
      .subscribe({
        error: (error: Error) => {
          expect(error.message).toBe('Пользователь с таким email уже зарегистрирован');
          expect(api.createUser).not.toHaveBeenCalled();
          done();
        },
      });
  });
});
