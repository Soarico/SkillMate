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
    materials: [
      {
        id: 1,
        title: 'Angular routing checklist',
        url: 'https://angular.dev/guide/routing',
        type: 'article',
        authorId: 1,
        createdAt: '2026-04-21T12:00:00.000Z',
      },
    ],
  },
];

async function mockApi(page: Page): Promise<void> {
  const apiUsers = users.map((user) => ({ ...user }));
  const apiGroups = groups.map((group) => ({
    ...group,
    memberIds: [...group.memberIds],
    materials: group.materials.map((material) => ({ ...material })),
  }));

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api', '');
    const method = request.method();

    if (path === '/users' && method === 'GET') {
      const email = url.searchParams.get('email');
      const body = email ? apiUsers.filter((user) => user.email === email) : apiUsers;

      await route.fulfill({ json: body });

      return;
    }

    if (path === '/users' && method === 'POST') {
      const createdUser = { id: 10, ...(await request.postDataJSON()) };
      apiUsers.push(createdUser);

      await route.fulfill({ json: createdUser });

      return;
    }

    if (path.startsWith('/users/') && method === 'GET') {
      const userId = Number(path.replace('/users/', ''));
      const user = apiUsers.find((item) => item.id === userId);

      await route.fulfill({ status: user ? 200 : 404, json: user ?? { message: 'Not found' } });

      return;
    }

    if (path.startsWith('/users/') && method === 'PATCH') {
      const userId = Number(path.replace('/users/', ''));
      const user = apiUsers.find((item) => item.id === userId);

      await route.fulfill({
        status: user ? 200 : 404,
        json: user ? { ...user, ...(await request.postDataJSON()) } : { message: 'Not found' },
      });

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
      await route.fulfill({ json: apiGroups });

      return;
    }

    if (path === '/groups' && method === 'POST') {
      const createdGroup = { id: 42, ...(await request.postDataJSON()) };
      apiGroups.push(createdGroup);

      await route.fulfill({ json: createdGroup });

      return;
    }

    if (path === '/groups/1' && method === 'PATCH') {
      const groupIndex = apiGroups.findIndex((group) => group.id === 1);
      const updatedGroup = { ...apiGroups[groupIndex], ...(await request.postDataJSON()) };
      apiGroups[groupIndex] = updatedGroup;

      await route.fulfill({ json: updatedGroup });

      return;
    }

    if (path === '/groups/1' && method === 'DELETE') {
      apiGroups.splice(
        apiGroups.findIndex((group) => group.id === 1),
        1,
      );

      await route.fulfill({ json: {} });

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

test('registers a new user and opens the dashboard', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Имя').fill('Новый Ученик');
  await page.getByLabel('Email').fill('new@student.test');
  await page.getByLabel('Пароль', { exact: true }).fill('skillmate');
  await page.getByLabel('Повтор пароля').fill('skillmate');
  await page.getByLabel('Город').fill('Москва');
  await page
    .getByLabel('О себе')
    .fill('Хочу найти партнёров для обмена навыками и регулярной практики.');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

  await expect(page.getByRole('heading', { name: /Подбор партнёров/ })).toBeVisible();
  await expect(page.getByText('Новый Ученик')).toBeVisible();
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

test('invites a partner to a group from the partner card', async ({ page }) => {
  await login(page);

  await page
    .locator('app-partner-card')
    .filter({ hasText: 'Лера Ким' })
    .getByRole('button', { name: 'Пригласить в группу' })
    .click();

  const inviteDialog = page.getByRole('dialog', { name: /Приглашение в группу для Лера Ким/ });

  await expect(inviteDialog).toBeVisible();
  await inviteDialog.getByLabel('Группа').selectOption({ label: 'Frontend study room' });
  await inviteDialog.getByRole('button', { name: 'Пригласить' }).click();

  await expect(
    page.getByText('Пользователь Лера Ким приглашён в группу «Frontend study room»'),
  ).toBeVisible();
});

test('deletes a group after irreversible action confirmation', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Группы' }).click();

  await expect(page.getByRole('heading', { name: 'Frontend study room' })).toBeVisible();
  await page
    .locator('.group-card')
    .filter({ hasText: 'Frontend study room' })
    .getByRole('button', { name: 'Удалить группу' })
    .click();

  await expect(
    page.getByRole('dialog', { name: /Удаление группы Frontend study room/ }),
  ).toBeVisible();
  await expect(page.getByText('Это действие нельзя отменить')).toBeVisible();
  await page.getByRole('button', { name: 'Да, удалить' }).click();

  await expect(page.getByText('Группа «Frontend study room» удалена')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Frontend study room' })).not.toBeVisible();
});

test('opens a group and removes members and materials', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Группы' }).click();

  await page
    .locator('.group-card')
    .filter({ hasText: 'Frontend study room' })
    .getByRole('button', { name: 'Открыть группу' })
    .click();

  const groupDialog = page.getByRole('dialog', { name: /Группа Frontend study room/ });

  await expect(groupDialog).toBeVisible();
  await expect(groupDialog.getByText('Аня Смирнова')).toBeVisible();
  await expect(groupDialog.getByText('Марк Ильин')).toBeVisible();
  await expect(groupDialog.getByText('Angular routing checklist')).toBeVisible();

  await groupDialog
    .locator('.detail-row')
    .filter({ hasText: 'Марк Ильин' })
    .getByRole('button', { name: 'Удалить участника' })
    .click();
  await expect(groupDialog.getByText('Марк Ильин')).not.toBeVisible();

  await groupDialog
    .locator('.detail-row')
    .filter({ hasText: 'Angular routing checklist' })
    .getByRole('button', { name: 'Удалить материал' })
    .click();
  await expect(groupDialog.getByText('Angular routing checklist')).not.toBeVisible();
});
