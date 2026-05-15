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

test('creates a learning session through the exchange popover', async ({ page }) => {
  await login(page);

  await page
    .locator('app-partner-card')
    .filter({ hasText: 'Марк Ильин' })
    .getByRole('button', { name: 'Предложить обмен' })
    .click();

  await expect(page.getByRole('dialog', { name: /Предложение обмена/ })).toBeVisible();
  await page.getByRole('button', { name: 'Отправить предложение' }).click();

  await expect(page.getByText('Предложение отправлено')).toBeVisible();
  await expect(page.getByText('Обмен: Figma')).toBeVisible();
  await expect(page.getByText('Ожидает подтверждения')).toBeVisible();
});

test('creates a review with rating from partner card', async ({ page }) => {
  await login(page);

  await page
    .locator('app-partner-card')
    .filter({ hasText: 'Марк Ильин' })
    .getByRole('button', { name: 'Оставить отзыв' })
    .click();

  const reviewDialog = page.getByRole('dialog', { name: /Отзыв для Марк Ильин/ });

  await expect(reviewDialog).toBeVisible();
  await reviewDialog.getByLabel('Оценка').selectOption({ label: '4 — хорошо' });
  await reviewDialog
    .getByRole('textbox', { name: 'Отзыв' })
    .fill('Помог разобраться с Figma и дал понятную обратную связь.');
  await reviewDialog.getByRole('button', { name: 'Сохранить отзыв' }).click();

  await expect(page.getByText('Отзыв сохранён. Оценка: 4/5')).toBeVisible();
});
