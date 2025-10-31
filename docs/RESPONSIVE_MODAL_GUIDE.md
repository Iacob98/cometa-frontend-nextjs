# Responsive Modal Design Guide

## ❌ Проблема

Модальные окна с фиксированной шириной (`max-w-2xl`, `max-w-4xl`) не адаптируются под маленькие экраны и вызывают горизонтальную прокрутку.

## ✅ Решение

### 1. Универсальный класс для DialogContent

Всегда используйте адаптивную ширину:

```tsx
// ❌ Неправильно - фиксированная ширина
<DialogContent className="max-w-4xl">

// ✅ Правильно - адаптивная ширина
<DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">

// ✅ Или проще для небольших диалогов
<DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl">
```

### 2. Высота и прокрутка

Добавьте max-height и overflow для длинного контента:

```tsx
// ✅ С ограничением высоты и прокруткой
<DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
```

### 3. Адаптивный padding

Уменьшайте отступы на маленьких экранах:

```tsx
// ✅ Адаптивные отступы
<CardContent className="p-3 sm:p-4 md:p-6">
<div className="space-y-3 sm:space-y-4">
```

### 4. Адаптивные grid columns

```tsx
// ✅ Адаптивная сетка
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
```

### 5. Стек элементов на мобильных

```tsx
// ✅ Вертикальный стек на мобильных, горизонтальный на десктопе
<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
```

## 📋 Checklist для модальных окон

- [ ] Используется адаптивная ширина (`w-full max-w-[95vw] sm:max-w-...`)
- [ ] Добавлен `max-h-[90vh]` для ограничения высоты
- [ ] Добавлен `overflow-y-auto` для прокрутки длинного контента
- [ ] Padding адаптивный (`p-3 sm:p-4 md:p-6`)
- [ ] Grid columns адаптивные (`grid-cols-1 sm:grid-cols-2...`)
- [ ] Flex direction адаптивный (`flex-col sm:flex-row`)
- [ ] Gap адаптивный (`gap-2 sm:gap-4`)
- [ ] Текст не переполняет контейнер (`text-sm sm:text-base`)
- [ ] Кнопки стакаются на мобильных (`flex-col sm:flex-row`)

## 🎯 Размеры модальных окон

### Маленькие диалоги (формы, подтверждения)
```tsx
className="w-full max-w-[95vw] sm:max-w-md"
```

### Средние диалоги (детали, редактирование)
```tsx
className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-lg lg:max-w-xl"
```

### Большие диалоги (списки, таблицы)
```tsx
className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl"
```

### Полноэкранные на мобильных
```tsx
className="w-full h-full sm:h-auto sm:max-w-[85vw] md:max-w-3xl max-h-[100vh] sm:max-h-[90vh]"
```

## 📱 Breakpoints

- **< 640px** (mobile): `default` - без префикса
- **≥ 640px** (small): `sm:`
- **≥ 768px** (medium): `md:`
- **≥ 1024px** (large): `lg:`
- **≥ 1280px** (xlarge): `xl:`

## 🔧 Примеры

### Worker Documents Dialog (большой)

```tsx
<DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
  <DialogHeader className="flex-shrink-0">
    {/* Header content */}
  </DialogHeader>

  <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
    {/* Scrollable content */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Cards */}
    </div>
  </div>
</DialogContent>
```

### Document Upload Dialog (средний)

```tsx
<DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-xl">
  <DialogHeader>
    <DialogTitle>Загрузить документ</DialogTitle>
  </DialogHeader>

  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Form fields */}
    </div>

    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
      <Button>Cancel</Button>
      <Button>Upload</Button>
    </div>
  </div>
</DialogContent>
```

### Edit Dialog (маленький)

```tsx
<DialogContent className="w-full max-w-[95vw] sm:max-w-md">
  <DialogHeader>
    <DialogTitle>Редактировать</DialogTitle>
  </DialogHeader>

  <div className="space-y-3 p-3 sm:p-4">
    {/* Form fields */}
  </div>
</DialogContent>
```

## 🚀 Автоматическое исправление

Используйте скрипт для поиска и исправления проблемных модалов:

```bash
./scripts/fix-responsive-modals.sh
```
