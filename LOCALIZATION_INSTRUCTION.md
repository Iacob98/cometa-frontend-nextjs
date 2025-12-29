# Инструкция по полной локализации COMETA на русский язык

## Обзор задачи

Полная локализация Next.js приложения на русский язык. Все тексты, сообщения, уведомления, ошибки, кнопки, заголовки, подписи должны быть на русском.

## Структура проекта

```
src/
├── app/
│   ├── (dashboard)/dashboard/     # Основные страницы
│   │   ├── activities/            # Журнал активности
│   │   ├── calendar/              # Календарь
│   │   ├── documents/             # Документы
│   │   ├── equipment/             # Оборудование
│   │   ├── financial/             # Финансы
│   │   ├── geospatial/            # Геопространственные данные
│   │   ├── houses/                # Жилые дома
│   │   ├── materials/             # Материалы
│   │   ├── notifications/         # Уведомления
│   │   ├── projects/              # Проекты
│   │   ├── settings/              # Настройки
│   │   ├── teams/                 # Команды
│   │   ├── vehicles/              # Транспорт
│   │   └── work-entries/          # Рабочие записи
│   ├── api/                       # API маршруты (сообщения об ошибках)
│   └── login/                     # Страница входа
├── components/                    # UI компоненты
├── hooks/                         # Хуки (toast уведомления)
└── lib/                           # Утилиты
```

## Чек-лист локализации

### 1. Компоненты Layout и Navigation

- [ ] `src/components/layout/sidebar.tsx` - боковая панель
- [ ] `src/components/layout/header.tsx` - шапка
- [ ] `src/components/layout/nav-*.tsx` - навигация
- [ ] `src/components/layout/user-menu.tsx` - меню пользователя

### 2. Страницы Dashboard

- [ ] `dashboard/page.tsx` - главная страница
- [ ] `dashboard/projects/` - проекты (list, new, [id])
- [ ] `dashboard/work-entries/` - рабочие записи
- [ ] `dashboard/teams/` - команды и бригады
- [ ] `dashboard/materials/` - материалы
- [ ] `dashboard/equipment/` - оборудование
- [ ] `dashboard/vehicles/` - транспорт
- [ ] `dashboard/documents/` - документы
- [ ] `dashboard/calendar/` - календарь
- [ ] `dashboard/notifications/` - уведомления
- [ ] `dashboard/activities/` - журнал активности
- [ ] `dashboard/financial/` - финансы
- [ ] `dashboard/geospatial/` - карты
- [ ] `dashboard/houses/` - жилые дома
- [ ] `dashboard/settings/` - настройки

### 3. Компоненты UI

- [ ] Таблицы (заголовки колонок, пагинация)
- [ ] Формы (labels, placeholders, кнопки)
- [ ] Диалоги (заголовки, описания, кнопки)
- [ ] Карточки (заголовки, статусы)
- [ ] Фильтры и поиск

### 4. Уведомления и Алерты

- [ ] Toast сообщения (sonner)
- [ ] Confirmation dialogs
- [ ] Error messages
- [ ] Success messages
- [ ] Loading states

### 5. API ответы

- [ ] Сообщения об ошибках
- [ ] Сообщения об успехе
- [ ] Валидационные ошибки

## Стандартные переводы

### Кнопки
| English | Русский |
|---------|---------|
| Save | Сохранить |
| Cancel | Отмена |
| Delete | Удалить |
| Edit | Редактировать |
| Create | Создать |
| Add | Добавить |
| Close | Закрыть |
| Submit | Отправить |
| Confirm | Подтвердить |
| Back | Назад |
| Next | Далее |
| Search | Поиск |
| Filter | Фильтр |
| Export | Экспорт |
| Import | Импорт |
| Download | Скачать |
| Upload | Загрузить |
| View | Просмотр |
| Details | Подробнее |
| Actions | Действия |

### Статусы
| English | Русский |
|---------|---------|
| Active | Активный |
| Inactive | Неактивный |
| Pending | Ожидание |
| Approved | Одобрено |
| Rejected | Отклонено |
| Draft | Черновик |
| Completed | Завершено |
| In Progress | В работе |
| Cancelled | Отменено |
| Expired | Истёк |

### Общие слова
| English | Русский |
|---------|---------|
| Dashboard | Панель управления |
| Projects | Проекты |
| Work Entries | Рабочие записи |
| Teams | Команды |
| Crews | Бригады |
| Materials | Материалы |
| Equipment | Оборудование |
| Vehicles | Транспорт |
| Documents | Документы |
| Calendar | Календарь |
| Notifications | Уведомления |
| Settings | Настройки |
| Reports | Отчёты |
| Financial | Финансы |
| Activities | Активность |
| Users | Пользователи |

### Формы
| English | Русский |
|---------|---------|
| Name | Название |
| Description | Описание |
| Status | Статус |
| Date | Дата |
| Created at | Создано |
| Updated at | Обновлено |
| Type | Тип |
| Category | Категория |
| Priority | Приоритет |
| Notes | Примечания |
| Select... | Выберите... |
| Enter... | Введите... |
| Required | Обязательное поле |
| Optional | Необязательно |

### Таблицы
| English | Русский |
|---------|---------|
| No data | Нет данных |
| Loading... | Загрузка... |
| Showing | Показано |
| of | из |
| rows | записей |
| Page | Страница |
| Previous | Назад |
| First | Первая |
| Last | Последняя |
| Sort by | Сортировать по |
| Ascending | По возрастанию |
| Descending | По убыванию |

### Уведомления
| English | Русский |
|---------|---------|
| Success | Успешно |
| Error | Ошибка |
| Warning | Предупреждение |
| Info | Информация |
| Saved successfully | Успешно сохранено |
| Deleted successfully | Успешно удалено |
| Updated successfully | Успешно обновлено |
| Created successfully | Успешно создано |
| Failed to save | Ошибка сохранения |
| Failed to delete | Ошибка удаления |
| Failed to load | Ошибка загрузки |
| Something went wrong | Что-то пошло не так |
| Please try again | Попробуйте снова |
| Are you sure? | Вы уверены? |
| This action cannot be undone | Это действие нельзя отменить |

## Порядок работы

1. **Начать с Layout** - sidebar, header, навигация
2. **Главная Dashboard** - основная страница
3. **Проекты** - самый используемый раздел
4. **Рабочие записи** - критически важный раздел
5. **Остальные страницы** - по алфавиту
6. **Компоненты** - переиспользуемые элементы
7. **Хуки** - уведомления в хуках
8. **API** - сообщения об ошибках

## Правила локализации

1. **НЕ трогать**:
   - Технические идентификаторы
   - Названия переменных
   - Ключи объектов
   - URL-ы

2. **Локализовать**:
   - Все видимые пользователю тексты
   - Placeholder-ы в формах
   - Title и aria-label атрибуты
   - Alt-тексты для изображений
   - Toast сообщения
   - Confirmation диалоги

3. **Проверять контекст**:
   - Один английский термин может иметь разные переводы
   - "Entry" в контексте работ = "Запись"
   - "Entry" в контексте данных = "Запись"

## Прогресс

- [ ] Layout и Navigation
- [ ] Dashboard главная
- [ ] Projects
- [ ] Work Entries
- [ ] Teams
- [ ] Materials
- [ ] Equipment
- [ ] Vehicles
- [ ] Documents
- [ ] Calendar
- [ ] Notifications
- [ ] Activities
- [ ] Financial
- [ ] Geospatial
- [ ] Houses
- [ ] Settings
- [ ] Хуки (toast)
- [ ] API сообщения
