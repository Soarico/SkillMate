import {
  ExchangeOffer,
  LearningSession,
  Review,
  SkillGroup,
  UserRecord,
} from '../models/skillmate.models';

export interface MockSkillmateData {
  users: UserRecord[];
  sessions: LearningSession[];
  offers: ExchangeOffer[];
  reviews: Review[];
  groups: SkillGroup[];
}

export const MOCK_SKILLMATE_DATA: MockSkillmateData = {
  users: [
    {
      id: 1,
      name: 'Аня Смирнова',
      email: 'anya@student.test',
      password: 'skillmate',
      city: 'Москва',
      avatarUrl: '',
      about:
        'Учусь на frontend-разработчика, могу объяснить TypeScript простыми словами и хочу подтянуть дизайн интерфейсов.',
      teachSkills: [
        {
          id: 'typescript-0',
          name: 'TypeScript',
          category: 'Teaching',
          level: 'beginner',
          description: 'Хочу развивать навык: TypeScript',
        },
        {
          id: 'публичные-выступления-1',
          name: 'Публичные выступления',
          category: 'Teaching',
          level: 'beginner',
          description: 'Хочу развивать навык: Публичные выступления',
        },
      ],
      learnSkills: [
        {
          id: 'figma-0',
          name: 'Figma',
          category: 'Learning',
          level: 'beginner',
          description: 'Хочу развивать навык: Figma',
        },
        {
          id: 'английский-1',
          name: 'Английский',
          category: 'Learning',
          level: 'beginner',
          description: 'Хочу развивать навык: Английский',
        },
      ],
      interests: ['frontend', 'design', 'languages'],
      progress: [
        {
          skill: 'Figma',
          completedLessons: 4,
          totalLessons: 10,
          nextMilestone: 'Собрать первый интерактивный прототип',
        },
        {
          skill: 'Английский',
          completedLessons: 7,
          totalLessons: 12,
          nextMilestone: 'Научиться поддерживать разговор на английском на базовые темы',
        },
      ],
      rating: 4.8,
      reviewCount: 12,
    },
    {
      id: 2,
      name: 'Марк Ильин',
      email: 'mark@student.test',
      password: 'skillmate',
      city: 'Казань',
      avatarUrl: '',
      about: 'Делаю интерфейсы в Figma и ищу человека, который поможет закрепить Angular и TypeScript.',
      teachSkills: [
        {
          id: 'figma-2',
          name: 'Figma',
          category: 'Design',
          level: 'advanced',
          description: 'Auto layout, компоненты, дизайн-система',
        },
        {
          id: 'prototyping-2',
          name: 'Прототипирование',
          category: 'Design',
          level: 'middle',
          description: 'User flow и интерактивные состояния',
        },
      ],
      learnSkills: [
        {
          id: 'typescript-2',
          name: 'TypeScript',
          category: 'Frontend',
          level: 'beginner',
          description: 'Типы и архитектура Angular',
        },
      ],
      interests: ['frontend', 'design', 'product'],
      progress: [],
      rating: 4.9,
      reviewCount: 18,
    },
    {
      id: 3,
      name: 'Лера Ким',
      email: 'lera@student.test',
      password: 'skillmate',
      city: 'Санкт-Петербург',
      avatarUrl: '',
      about:
        'Практикую английский, люблю объяснять грамматику через живые диалоги и хочу лучше выступать перед аудиторией.',
      teachSkills: [
        {
          id: 'english-3',
          name: 'Английский',
          category: 'Languages',
          level: 'advanced',
          description: 'Speaking practice, grammar, vocabulary',
        },
      ],
      learnSkills: [
        {
          id: 'public-speaking-3',
          name: 'Публичные выступления',
          category: 'Soft skills',
          level: 'beginner',
          description: 'Уверенность и структура выступления',
        },
      ],
      interests: ['languages', 'soft skills', 'education'],
      progress: [],
      rating: 4.7,
      reviewCount: 9,
    },
    {
      id: 4,
      name: 'Даня Орлов',
      email: 'danya@student.test',
      password: 'skillmate',
      city: 'Екатеринбург',
      avatarUrl: '',
      about:
        'Собираю пет-проекты на Angular, могу помочь с RxJS и хочу научиться лучше упаковывать проекты в презентации.',
      teachSkills: [
        {
          id: 'rxjs-4',
          name: 'RxJS',
          category: 'Frontend',
          level: 'middle',
          description: 'Потоки, операторы, обработка ошибок',
        },
        {
          id: 'angular-4',
          name: 'Angular',
          category: 'Frontend',
          level: 'middle',
          description: 'Компоненты, роутинг, guards',
        },
      ],
      learnSkills: [
        {
          id: 'public-speaking-4',
          name: 'Публичные выступления',
          category: 'Soft skills',
          level: 'beginner',
          description: 'Демо проекта на защите',
        },
      ],
      interests: ['frontend', 'education', 'career'],
      progress: [],
      rating: 4.6,
      reviewCount: 7,
    },
  ],
  sessions: [
    {
      id: 1,
      hostId: 1,
      partnerId: 2,
      topic: 'Figma auto layout',
      startsAt: '2026-04-29T15:00:00.000Z',
      durationMinutes: 60,
      status: 'planned',
      notes: 'Разобрать карточку партнёра',
    },
  ],
  offers: [
    {
      id: 1,
      fromUserId: 1,
      toUserId: 2,
      teachSkill: 'TypeScript',
      learnSkill: 'Figma',
      message: 'Обмен TypeScript на Figma',
      status: 'pending',
      createdAt: '2026-04-20T10:00:00.000Z',
    },
  ],
  reviews: [
    {
      id: 1,
      authorId: 2,
      partnerId: 1,
      rating: 5,
      text: 'Аня объясняет спокойно и по шагам.',
      createdAt: '2026-04-18T11:00:00.000Z',
    },
  ],
  groups: [
    {
      id: 1,
      title: 'Frontend study room',
      description: 'Группа для обмена материалами по Angular, RxJS и TypeScript.',
      interest: 'frontend',
      ownerId: 1,
      memberIds: [1, 2],
      materials: [
        {
          id: 1,
          title: 'Angular routing checklist',
          url: 'https://angular.dev/guide/routing',
          type: 'article',
          authorId: 4,
          createdAt: '2026-04-21T12:00:00.000Z',
        },
      ],
    },
    {
      id: 2,
      title: 'Speaking practice',
      description: 'Короткие созвоны для английского и подготовки к защите.',
      interest: 'languages',
      ownerId: 3,
      memberIds: [1, 3],
      materials: [],
    },
  ],
};
