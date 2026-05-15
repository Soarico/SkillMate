# SkillMate

SkillMate - школьный семестровый проект на Angular 21: платформа для поиска партнёров по обмену навыками, планирования учебных сессий, отзывов, групп и материалов.

## Демо-доступ

Все mock-пользователи могут входить в приложение:

| Пользователь | Email                | Пароль      |
| ------------ | -------------------- | ----------- |
| Аня Смирнова | `anya@student.test`  | `skillmate` |
| Марк Ильин   | `mark@student.test`  | `skillmate` |
| Лера Ким     | `lera@student.test`  | `skillmate` |
| Даня Орлов   | `danya@student.test` | `skillmate` |

## Стек

- Angular 21, TypeScript, standalone components, lazy routes
- Taiga UI 4: `TuiRoot`, `TuiButton`, `TuiLoader`, `TuiNotification`, `TuiBadge`, `TuiProgress`, `TuiCard`
- Signal Store: `@ngrx/signals`
- Mock API: `json-server`
- Unit-тесты: Jest
- Component/e2e-сценарии: Playwright
- Качество кода: ESLint, Prettier, Stylelint
- CI/CD: GitLab CI pipeline и GitHub Actions

## Запуск

```bash
npm install
npm run dev
```

`npm run dev` поднимает Angular на `http://localhost:4200` и mock API на `http://127.0.0.1:3001`.

Отдельные команды:

```bash
npm run mock:api
npm run start
npm run build
npm run test
npm run e2e
npm run lint
npm run stylelint
```

## Структура

```text
src/app/core      auth, guards, interceptors, API services, Signal Store, models
src/app/features  lazy-loaded pages: login, dashboard, profile, groups
src/app/shared    reusable component, pipe, pure utils
mock/db.json      mock data for json-server
docs/             plan, UX concept, local prototype
tests/e2e         Playwright scenarios
```

## Реализованные сценарии

- Login/logout с хранением mock JWT в `localStorage`
- Регистрация нового пользователя через mock API
- Protected routes через `authGuard`
- Token и error interceptors для HTTP
- Профиль с навыками, интересами и прогрессом
- Поиск, фильтрация и сортировка партнёров
- Расчёт совместимости и среднего прогресса
- Предложение обмена навыками
- Планирование и удаление учебных сессий
- Создание групп, приглашение участников и добавление материалов
- Создание отзывов о партнёрах

## Деплой

Подготовлены два варианта:

- GitLab Pages: `.gitlab-ci.yml` публикует `dist/skillmate/browser` из ветки `main`
- Vercel: `vercel.json` использует `npm run build` и SPA rewrite

Публичный URL нужно добавить после привязки репозитория к GitLab Pages или Vercel.

## Документация

- [План разработки](docs/plan.md)
- [UX-концепция](docs/ux.md)
- [Локальный прототип](docs/prototype.md)
