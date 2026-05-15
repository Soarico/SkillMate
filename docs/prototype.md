# Локальный UX-прототип

Этот файл заменяет внешний Figma/Unidraw/Miro для репозитория. Перед сдачей можно перенести эти экраны в Figma и заменить ссылку в `docs/ux.md`.

## Экран 1: Login

Состояние входа показывает короткое описание продукта и форму авторизации.

```mermaid
flowchart LR
  A["SkillMate value proposition"] --- B["Login form: email, password, submit"]
  B --> C["Validation / API error"]
```

## Экран 2: Dashboard

Главный экран после входа: прогресс, поиск, фильтры, список партнёров и окно предложения обмена из карточки партнёра.

```mermaid
flowchart TB
  A["Progress stats"] --> B["Search, category, sorting"]
  B --> C["Partner cards with compatibility"]
  C --> D["Exchange popover: topic, time, duration"]
  C --> E["Create review"]
  D --> F["Offer and planned session"]
```

## Экран 3: Profile

Форма редактирования профиля с навыками, целями и интересами.

```mermaid
flowchart TB
  A["Profile form"] --> B["Teach skills"]
  A --> C["Learn skills"]
  A --> D["Interests"]
  B --> E["Save to mock API"]
```

## Экран 4: Groups

Создание групп и добавление материалов.

```mermaid
flowchart TB
  A["Create group"] --> C["Groups list"]
  B["Add material"] --> C
  C --> D["Materials links"]
```
