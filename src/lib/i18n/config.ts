// Internationalization configuration for COMETA
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'de', 'ru', 'uz', 'tr'] as const;
export const defaultLocale = 'de' as const;

export type Locale = typeof locales[number];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({
    locales,
    pathnames: {
      '/': '/',
      '/login': {
        en: '/login',
        de: '/anmelden',
        ru: '/вход',
        uz: '/kirish',
        tr: '/giris',
      },
      '/dashboard': {
        en: '/dashboard',
        de: '/dashboard',
        ru: '/панель',
        uz: '/boshqaruv',
        tr: '/panel',
      },
      '/dashboard/projects': {
        en: '/dashboard/projects',
        de: '/dashboard/projekte',
        ru: '/панель/проекты',
        uz: '/boshqaruv/loyihalar',
        tr: '/panel/projeler',
      },
      '/dashboard/projects/[id]': {
        en: '/dashboard/projects/[id]',
        de: '/dashboard/projekte/[id]',
        ru: '/панель/проекты/[id]',
        uz: '/boshqaruv/loyihalar/[id]',
        tr: '/panel/projeler/[id]',
      },
      '/dashboard/projects/new': {
        en: '/dashboard/projects/new',
        de: '/dashboard/projekte/neu',
        ru: '/панель/проекты/новый',
        uz: '/boshqaruv/loyihalar/yangi',
        tr: '/panel/projeler/yeni',
      },
      '/dashboard/work-entries': {
        en: '/dashboard/work-entries',
        de: '/dashboard/arbeitseinträge',
        ru: '/панель/рабочие-записи',
        uz: '/boshqaruv/ish-yozuvlari',
        tr: '/panel/is-kayitlari',
      },
      '/dashboard/teams': {
        en: '/dashboard/teams',
        de: '/dashboard/teams',
        ru: '/панель/команды',
        uz: '/boshqaruv/jamoalar',
        tr: '/panel/takimlar',
      },
      '/dashboard/materials': {
        en: '/dashboard/materials',
        de: '/dashboard/materialien',
        ru: '/панель/материалы',
        uz: '/boshqaruv/materiallar',
        tr: '/panel/malzemeler',
      },
      '/dashboard/reports': {
        en: '/dashboard/reports',
        de: '/dashboard/berichte',
        ru: '/панель/отчеты',
        uz: '/boshqaruv/hisobotlar',
        tr: '/panel/raporlar',
      },
    },
  });

// Language display names
export const languageNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  ru: 'Русский',
  uz: 'O\'zbekcha',
  tr: 'Türkçe',
};

// Language configuration for different contexts
export const languageConfig = {
  // Default language for system (matches Streamlit backend)
  systemDefault: 'de' as const,

  // Fallback chain - if a translation is missing, try these languages in order
  fallbackChain: ['de', 'en', 'ru'] as const,

  // Languages with RTL support (none for these languages, but structure is ready)
  rtlLanguages: [] as const,

  // Date/time formats for each locale
  dateTimeFormats: {
    en: {
      short: 'MM/dd/yyyy',
      long: 'MMMM dd, yyyy',
      time: 'HH:mm',
      dateTime: 'MM/dd/yyyy HH:mm',
    },
    de: {
      short: 'dd.MM.yyyy',
      long: 'dd. MMMM yyyy',
      time: 'HH:mm',
      dateTime: 'dd.MM.yyyy HH:mm',
    },
    ru: {
      short: 'dd.MM.yyyy',
      long: 'dd MMMM yyyy г.',
      time: 'HH:mm',
      dateTime: 'dd.MM.yyyy HH:mm',
    },
    uz: {
      short: 'dd.MM.yyyy',
      long: 'dd-MMMM, yyyy',
      time: 'HH:mm',
      dateTime: 'dd.MM.yyyy HH:mm',
    },
    tr: {
      short: 'dd.MM.yyyy',
      long: 'dd MMMM yyyy',
      time: 'HH:mm',
      dateTime: 'dd.MM.yyyy HH:mm',
    },
  },

  // Number formats
  numberFormats: {
    en: {
      decimal: '.',
      thousands: ',',
      currency: 'USD',
    },
    de: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR',
    },
    ru: {
      decimal: ',',
      thousands: ' ',
      currency: 'EUR',
    },
    uz: {
      decimal: ',',
      thousands: ' ',
      currency: 'USD',
    },
    tr: {
      decimal: ',',
      thousands: '.',
      currency: 'TRY',
    },
  },
} as const;

// Helper function to detect user language
export function detectUserLanguage(
  browserLanguages: readonly string[],
  savedLanguage?: string
): Locale {
  // 1. Use saved language if valid
  if (savedLanguage && locales.includes(savedLanguage as Locale)) {
    return savedLanguage as Locale;
  }

  // 2. Check browser languages
  for (const browserLang of browserLanguages) {
    const lang = browserLang.split('-')[0].toLowerCase();
    if (locales.includes(lang as Locale)) {
      return lang as Locale;
    }
  }

  // 3. Fallback to default
  return defaultLocale;
}

// Helper function to get direction for a locale
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return languageConfig.rtlLanguages.includes(locale as any) ? 'rtl' : 'ltr';
}

// Helper function to format dates based on locale
export function formatDate(
  date: Date,
  locale: Locale,
  format: keyof typeof languageConfig.dateTimeFormats[Locale] = 'short'
): string {
  const formatString = languageConfig.dateTimeFormats[locale][format];

  // Simple date formatting - in production, use a library like date-fns
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return formatString
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('HH', hour)
    .replace('mm', minute);
}

// Helper function to format numbers based on locale
export function formatNumber(
  number: number,
  locale: Locale,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    style?: 'decimal' | 'currency' | 'percent';
  }
): string {
  const config = languageConfig.numberFormats[locale];

  if (options?.style === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.currency,
      ...options,
    }).format(number);
  }

  return new Intl.NumberFormat(locale, options).format(number);
}

// Export type for use in other files
export type LanguageConfig = typeof languageConfig;