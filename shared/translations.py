import streamlit as st

LANGUAGES = {
    'en': 'English',
    'ru': 'Русский',
    'de': 'Deutsch'
}

TRANSLATIONS = {
    # Common
    'welcome': {
        'en': 'Welcome',
        'ru': 'Добро пожаловать',
        'de': 'Willkommen'
    },
    'login': {
        'en': 'Login',
        'ru': 'Войти',
        'de': 'Anmelden'
    },
    'logout': {
        'en': 'Logout',
        'ru': 'Выйти',
        'de': 'Abmelden'
    },
    'save': {
        'en': 'Save',
        'ru': 'Сохранить',
        'de': 'Speichern'
    },
    'cancel': {
        'en': 'Cancel',
        'ru': 'Отмена',
        'de': 'Abbrechen'
    },
    'delete': {
        'en': 'Delete',
        'ru': 'Удалить',
        'de': 'Löschen'
    },
    'edit': {
        'en': 'Edit',
        'ru': 'Редактировать',
        'de': 'Bearbeiten'
    },
    'view': {
        'en': 'View',
        'ru': 'Просмотр',
        'de': 'Ansehen'
    },
    'create': {
        'en': 'Create',
        'ru': 'Создать',
        'de': 'Erstellen'
    },
    'update': {
        'en': 'Update',
        'ru': 'Обновить',
        'de': 'Aktualisieren'
    },
    'search': {
        'en': 'Search',
        'ru': 'Поиск',
        'de': 'Suchen'
    },
    'filter': {
        'en': 'Filter',
        'ru': 'Фильтр',
        'de': 'Filter'
    },
    'status': {
        'en': 'Status',
        'ru': 'Статус',
        'de': 'Status'
    },
    'date': {
        'en': 'Date',
        'ru': 'Дата',
        'de': 'Datum'
    },
    'name': {
        'en': 'Name',
        'ru': 'Имя',
        'de': 'Name'
    },
    'email': {
        'en': 'Email',
        'ru': 'Электронная почта',
        'de': 'E-Mail'
    },
    'phone': {
        'en': 'Phone',
        'ru': 'Телефон',
        'de': 'Telefon'
    },
    'address': {
        'en': 'Address',
        'ru': 'Адрес',
        'de': 'Adresse'
    },
    'notes': {
        'en': 'Notes',
        'ru': 'Примечания',
        'de': 'Notizen'
    },
    
    # Authentication
    'login_title': {
        'en': 'Login to Fiber Construction Management',
        'ru': 'Вход в систему управления строительством оптоволокна',
        'de': 'Anmeldung zur Glasfaser-Bauverwaltung'
    },
    'login_success': {
        'en': 'Login successful!',
        'ru': 'Вход выполнен успешно!',
        'de': 'Anmeldung erfolgreich!'
    },
    'login_failed': {
        'en': 'Login failed. Please check your credentials.',
        'ru': 'Ошибка входа. Проверьте ваши данные.',
        'de': 'Anmeldung fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.'
    },
    
    # User roles
    'admin': {
        'en': 'Administrator',
        'ru': 'Администратор',
        'de': 'Administrator'
    },
    'pm': {
        'en': 'Project Manager',
        'ru': 'Менеджер проекта',
        'de': 'Projektleiter'
    },
    'foreman': {
        'en': 'Foreman',
        'ru': 'Бригадир',
        'de': 'Vorarbeiter'
    },
    'crew': {
        'en': 'Crew Member',
        'ru': 'Работник',
        'de': 'Arbeiter'
    },
    'viewer': {
        'en': 'Viewer',
        'ru': 'Наблюдатель',
        'de': 'Betrachter'
    },
    
    # Dashboard
    'dashboard_title': {
        'en': 'Project Dashboard',
        'ru': 'Панель управления проектами',
        'de': 'Projekt-Dashboard'
    },
    'project_overview': {
        'en': 'Project Overview',
        'ru': 'Обзор проектов',
        'de': 'Projektübersicht'
    },
    'total_projects': {
        'en': 'Total Projects',
        'ru': 'Всего проектов',
        'de': 'Projekte insgesamt'
    },
    'active_projects': {
        'en': 'Active Projects',
        'ru': 'Активные проекты',
        'de': 'Aktive Projekte'
    },
    'completion_rate': {
        'en': 'Completion Rate',
        'ru': 'Процент завершения',
        'de': 'Abschlussrate'
    },
    'total_costs': {
        'en': 'Total Costs',
        'ru': 'Общие затраты',
        'de': 'Gesamtkosten'
    },
    'project_progress': {
        'en': 'Project Progress',
        'ru': 'Прогресс проектов',
        'de': 'Projektfortschritt'
    },
    'recent_activity': {
        'en': 'Recent Activity',
        'ru': 'Последняя активность',
        'de': 'Letzte Aktivitäten'
    },
    'no_recent_activity': {
        'en': 'No recent activity',
        'ru': 'Нет последней активности',
        'de': 'Keine aktuellen Aktivitäten'
    },
    
    # Navigation
    'navigation': {
        'en': 'Navigation',
        'ru': 'Навигация',
        'de': 'Navigation'
    },
    'dashboard': {
        'en': 'Dashboard',
        'ru': 'Панель',
        'de': 'Dashboard'
    },
    'projects': {
        'en': 'Projects',
        'ru': 'Проекты',
        'de': 'Projekte'
    },
    'work_entries': {
        'en': 'Work Entries',
        'ru': 'Записи работ',
        'de': 'Arbeitseinträge'
    },
    'teams': {
        'en': 'Teams',
        'ru': 'Команды',
        'de': 'Teams'
    },
    'materials': {
        'en': 'Materials',
        'ru': 'Материалы',
        'de': 'Materialien'
    },
    'financial': {
        'en': 'Financial',
        'ru': 'Финансы',
        'de': 'Finanzen'
    },
    'reports': {
        'en': 'Reports',
        'ru': 'Отчеты',
        'de': 'Berichte'
    },
    
    # Projects
    'create_project': {
        'en': 'Create Project',
        'ru': 'Создать проект',
        'de': 'Projekt erstellen'
    },
    'project_name': {
        'en': 'Project Name',
        'ru': 'Название проекта',
        'de': 'Projektname'
    },
    'customer': {
        'en': 'Customer',
        'ru': 'Заказчик',
        'de': 'Kunde'
    },
    'city': {
        'en': 'City',
        'ru': 'Город',
        'de': 'Stadt'
    },
    'total_length': {
        'en': 'Total Length (m)',
        'ru': 'Общая длина (м)',
        'de': 'Gesamtlänge (m)'
    },
    'rate_per_meter': {
        'en': 'Rate per Meter (€)',
        'ru': 'Ставка за метр (€)',
        'de': 'Preis pro Meter (€)'
    },
    'start_date': {
        'en': 'Start Date',
        'ru': 'Дата начала',
        'de': 'Startdatum'
    },
    'end_date': {
        'en': 'End Date',
        'ru': 'Дата окончания',
        'de': 'Enddatum'
    },
    
    # Work Entries
    'create_work_entry': {
        'en': 'Create Work Entry',
        'ru': 'Создать запись работы',
        'de': 'Arbeitseintrag erstellen'
    },
    'meters_done': {
        'en': 'Meters Done',
        'ru': 'Метров выполнено',
        'de': 'Meter erledigt'
    },
    'stage': {
        'en': 'Stage',
        'ru': 'Этап',
        'de': 'Phase'
    },
    'method': {
        'en': 'Method',
        'ru': 'Метод',
        'de': 'Methode'
    },
    'upload_photos': {
        'en': 'Upload Photos',
        'ru': 'Загрузить фото',
        'de': 'Fotos hochladen'
    },
    'approve': {
        'en': 'Approve',
        'ru': 'Одобрить',
        'de': 'Genehmigen'
    },
    'approved': {
        'en': 'Approved',
        'ru': 'Одобрено',
        'de': 'Genehmigt'
    },
    'pending': {
        'en': 'Pending',
        'ru': 'В ожидании',
        'de': 'Ausstehend'
    },
    
    # Teams
    'create_team': {
        'en': 'Create Team',
        'ru': 'Создать команду',
        'de': 'Team erstellen'
    },
    'team_name': {
        'en': 'Team Name',
        'ru': 'Название команды',
        'de': 'Teamname'
    },
    'foreman_name': {
        'en': 'Foreman',
        'ru': 'Бригадир',
        'de': 'Vorarbeiter'
    },

    'team_members': {
        'en': 'Team Members',
        'ru': 'Члены команды',
        'de': 'Teammitglieder'
    },
    
    # Materials
    'material_name': {
        'en': 'Material Name',
        'ru': 'Название материала',
        'de': 'Materialname'
    },
    'unit': {
        'en': 'Unit',
        'ru': 'Единица',
        'de': 'Einheit'
    },
    'quantity': {
        'en': 'Quantity',
        'ru': 'Количество',
        'de': 'Menge'
    },
    'price': {
        'en': 'Price',
        'ru': 'Цена',
        'de': 'Preis'
    },
    'inventory': {
        'en': 'Inventory',
        'ru': 'Запас',
        'de': 'Bestand'
    },
    
    # Financial
    'revenue': {
        'en': 'Revenue',
        'ru': 'Доход',
        'de': 'Umsatz'
    },
    'costs': {
        'en': 'Costs',
        'ru': 'Затраты',
        'de': 'Kosten'
    },
    'profit': {
        'en': 'Profit',
        'ru': 'Прибыль',
        'de': 'Gewinn'
    },
    'budget': {
        'en': 'Budget',
        'ru': 'Бюджет',
        'de': 'Budget'
    },
    'email': {
        'en': 'Email',
        'ru': 'Email',
        'de': 'Email'
    },
    'password': {
        'en': 'Password',
        'ru': 'Пароль',
        'de': 'Passwort'
    },
    'invalid_credentials': {
        'en': 'Invalid email or password',
        'ru': 'Неверный email или пароль',
        'de': 'Ungültige E-Mail oder Passwort'
    },
    'fill_all_fields': {
        'en': 'Please fill all fields',
        'ru': 'Пожалуйста, заполните все поля',
        'de': 'Bitte füllen Sie alle Felder aus'
    }
}

def get_text(key: str, default: str = None) -> str:
    """Get translated text for current language"""
    language = st.session_state.get('language', 'de')
    
    if key in TRANSLATIONS:
        return TRANSLATIONS[key].get(language, TRANSLATIONS[key].get('en', key))
    
    return default or key

def set_language(language: str):
    """Set the current language"""
    if language in LANGUAGES:
        st.session_state.language = language

def get_stage_name(stage_code: str) -> str:
    """Get stage name in current language"""
    from database import get_session
    from models import StageDef
    
    language = st.session_state.get('language', 'de')  # Default to German
    
    # Handle house connection specific stages
    house_stage_names = {
        'house_connection': {'ru': 'Подключение дома', 'en': 'House Connection', 'de': 'Hausanschluss'},
        'house_photo_before': {'ru': '📷 Фото до работ', 'en': 'Photo Before Work', 'de': 'Foto vor Arbeit'},
        'house_photo_during': {'ru': '📷 Фото во время работ', 'en': 'Photo During Work', 'de': 'Foto während Arbeit'},
        'house_photo_after': {'ru': '📷 Фото после работ', 'en': 'Photo After Work', 'de': 'Foto nach Arbeit'},
    }
    
    if stage_code in house_stage_names:
        return house_stage_names[stage_code].get(language, house_stage_names[stage_code]['ru'])
    
    session = get_session()
    try:
        stage_def = session.query(StageDef).filter(StageDef.code == stage_code).first()
        if stage_def:
            if language == 'ru':
                return stage_def.name_ru
            elif language == 'de':
                return stage_def.name_de
            else:
                return stage_def.name_ru  # Fallback
        return stage_code
    except Exception:
        return stage_code
    finally:
        session.close()
