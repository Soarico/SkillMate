import { expect, Page, test } from '@playwright/test';

const users = [
  {
    id: 1,
    name: 'Аня Смирнова',
    email: 'anya@student.test',
    password: 'skillmate',
    city: 'Москва',
    avatarUrl: '',
    about: 'Учусь на frontend-разработчика и хочу подтянуть дизайн интерфейсов.',
    teachSkills: [
      {
        id: 'typescript-1',
        name: 'TypeScript',
        category: 'Frontend',
        level: 'middle',
        description: '',
      },
    ],
    learnSkills: [
      { id: 'figma-1', name: 'Figma', category: 'Design', level: 'beginner', description: '' },
    ],
    interests: ['frontend', 'design'],
    progress: [
      { skill: 'Figma', completedLessons: 4, totalLessons: 10, nextMilestone: 'Собрать прототип' },
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
    about: 'Делаю интерфейсы в Figma и ищу практику TypeScript.',
    teachSkills: [
      { id: 'figma-2', name: 'Figma', category: 'Design', level: 'advanced', description: '' },
    ],
    learnSkills: [
      {
        id: 'typescript-2',
        name: 'TypeScript',
        category: 'Frontend',
        level: 'beginner',
        description: '',
      },
    ],
    interests: ['frontend', 'design'],
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
    about: 'Практикую английский и готовлю короткие разговорные занятия.',
    teachSkills: [
      {
        id: 'english-3',
        name: 'Английский',
        category: 'Languages',
        level: 'advanced',
        description: '',
      },
    ],
    learnSkills: [
      {
        id: 'public-speaking-3',
        name: 'Публичные выступления',
        category: 'Soft skills',
        level: 'beginner',
        description: '',
      },
    ],
    interests: ['languages'],
    progress: [],
    rating: 4.7,
    reviewCount: 9,
  },
];

const groups = [
  {
    id: 1,
    title: 'Frontend study room',
    description: 'Материалы по Angular и TypeScript.',
    interest: 'frontend',
    ownerId: 1,
    memberIds: [1, 2],
    materials: [],
  },
];

async function mockApi(page: Page): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api', '');
    const method = request.method();

    if (path === '/users' && method === 'GET') {
      const email = url.searchParams.get('email');
      const body = email ? users.filter((user) => user.email === email) : users;

      await route.fulfill({ json: body });

      return;
    }

    if (path === '/users/1' && method === 'GET') {
      await route.fulfill({ json: users[0] });

      return;
    }

    if (path === '/users/1' && method === 'PATCH') {
      await route.fulfill({ json: { ...users[0], ...(await request.postDataJSON()) } });

      return;
    }

    if (path === '/sessions' && method === 'GET') {
      await route.fulfill({ json: [] });

      return;
    }

    if (path === '/sessions' && method === 'POST') {
      await route.fulfill({ json: { id: 99, ...(await request.postDataJSON()) } });

      return;
    }

    if (path === '/offers' && method === 'POST') {
      await route.fulfill({ json: { id: 77, ...(await request.postDataJSON()) } });

      return;
    }

    if (path === '/reviews' && method === 'GET') {
      await route.fulfill({ json: [] });

      return;
    }

    if (path === '/reviews' && method === 'POST') {
      await route.fulfill({ json: { id: 88, ...(await request.postDataJSON()) } });

      return;
    }

    if (path === '/groups' && method === 'GET') {
      await route.fulfill({ json: groups });

      return;
    }

    if (path === '/groups' && method === 'POST') {
      await route.fulfill({ json: { id: 42, ...(await request.postDataJSON()) } });

      return;
    }

    await route.fulfill({ status: 404, json: { message: `No mock for ${method} ${path}` } });
  });
}

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill('anya@student.test');
  await page.getByLabel('Пароль').fill('skillmate');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByRole('heading', { name: /Подбор партнёров/ })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('login opens protected dashboard', async ({ page }) => {
  await login(page);

  await expect(page.getByRole('heading', { name: 'Марк Ильин' })).toBeVisible();
});

test('filters partners by skill', async ({ page }) => {
  await login(page);

  await page.getByPlaceholder('Навык, город, имя').fill('Figma');

  await expect(page.getByRole('heading', { name: 'Марк Ильин' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Лера Ким' })).not.toBeVisible();
});

test('creates a learning session through the form', async ({ page }) => {
  await login(page);

  await page.locator('select[formcontrolname="partnerId"]').selectOption({ label: 'Марк Ильин' });
  await page.getByLabel('Тема').fill('Figma basics');
  await page.getByLabel('Дата и время').fill('2026-05-20T14:00');
  await page.getByLabel('Длительность, минут').fill('45');
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByText('Сессия добавлена в расписание')).toBeVisible();
});
