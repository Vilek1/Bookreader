# Bottom Bar Files Overview

Структура файлов компонента нижней навигации.

## 📂 Файлы

### 1. `bottom-bar.tsx` ⭐ **Основной компонент**
- Основной React компонент
- Встроенные SVG иконки (LibraryIcon, SettingsIcon, BookIcon, CurveBackground)
- Логика навигации и активных состояний
- Responsive FAB (Floating Action Button)
- ARIA accessibility атрибуты

**Импорт:**
```tsx
import { BottomBar } from "./components/bottom-bar";
<BottomBar activeBookId="book-123" />
```

---

### 2. `bottom-bar-tokens.ts` 📊 **Design Tokens**
- Централизованные константы дизайна
- Размеры (heights, iconSize, fabSize)
- Цвета (activeColor, activeTextColor, inactiveBg)
- Типография (fontSize, lineHeight, fontFamily)
- CSS переменные (navBg, iconMuted, textMuted)
- Liquid Glass класс

**Импорт:**
```tsx
import { BOTTOM_BAR_TOKENS, LIQUID_GLASS_CLASS } from "./components/bottom-bar-tokens";
```

**Использование:**
```tsx
<div style={{ height: BOTTOM_BAR_TOKENS.containerHeight }}>
  {/* content */}
</div>
```

---

### 3. `bottom-bar-types.ts` 📝 **TypeScript Types**
- `BottomBarProps` - Props компонента
- `BottomBarRoute` - Тип маршрута ("library" | "book" | "settings")
- `BottomBarActiveState` - Состояния активности маршрутов

**Импорт:**
```tsx
import type { BottomBarProps } from "./components/bottom-bar-types";
```

---

### 4. `bottom-nav.tsx` 🔄 **Legacy Re-export**
- Обратная совместимость со старым кодом
- Просто re-export из `bottom-bar.tsx`

**Импорт (старый способ):**
```tsx
import { BottomNav } from "./components/bottom-nav";
<BottomNav activeBookId="book-123" />
```

---

### 5. `bottom-bar.index.ts` 📦 **Barrel Export**
- Централизованный экспорт всех частей
- Удобный единый импорт

**Импорт (рекомендуется):**
```tsx
import { 
  BottomBar, 
  BOTTOM_BAR_TOKENS, 
  LIQUID_GLASS_CLASS 
} from "./components/bottom-bar.index";
```

---

### 6. `BOTTOM_BAR_README.md` 📚 **Документация**
- Полная документация компонента
- Примеры использования
- Руководство по кастомизации
- Архитектура и особенности

---

### 7. `BOTTOM_BAR_FILES.md` (этот файл) 📋 **Обзор файлов**
- Краткое описание всех файлов
- Быстрая справка по импортам

---

## 🔗 Связанные файлы

### `/src/styles/theme.css`
CSS переменные для темизации:
```css
:root {
  --app-nav-bg: #F5F5F5;
  --app-icon-muted: #717680;
  --app-text-muted: #A4A7AE;
  --app-text-secondary: #535862;
}

.dark {
  --app-nav-bg: #0C0E12;
  --app-icon-muted: #A4A7AE;
  --app-text-muted: #535862;
  --app-text-secondary: #cecfd2;
}

/* Liquid Glass эффект */
.glass {
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  background-color: rgba(245, 245, 245, 0.7);
}

.dark .glass {
  background-color: rgba(12, 14, 18, 0.7);
}
```

---

## 🚀 Быстрый старт

### Вариант 1: Базовое использование
```tsx
import { BottomBar } from "./components/bottom-bar";

function Layout() {
  return (
    <div>
      <main>{/* content */}</main>
      <BottomBar activeBookId={currentBookId} />
    </div>
  );
}
```

### Вариант 2: С Liquid Glass эффектом
```tsx
import { BottomBar } from "./components/bottom-bar";
import { LIQUID_GLASS_CLASS } from "./components/bottom-bar-tokens";

function Layout() {
  return (
    <div>
      <main>{/* content */}</main>
      <div className={LIQUID_GLASS_CLASS}>
        <BottomBar activeBookId={currentBookId} />
      </div>
    </div>
  );
}
```

### Вариант 3: Кастомизация токенов
```tsx
import { BOTTOM_BAR_TOKENS } from "./components/bottom-bar-tokens";

// Переопределить токены (в новом файле custom-tokens.ts)
export const MY_TOKENS = {
  ...BOTTOM_BAR_TOKENS,
  fabSize: 64,
  activeColor: "#FF5733",
};
```

---

## 📊 Размеры компонента

```
┌─────────────────────────────────┐
│                                 │
│         FAB (-22px)             │ ← Floating Action Button
│          ┌────┐                 │
│          │    │                 │
├──────────┴────┴─────────────────┤
│                                 │
│  [Library]  [Book]  [Settings]  │ ← Navigation Items (75px)
│                                 │
└─────────────────────────────────┘
         Total: 108px
```

---

## 🎨 Иконки

Все иконки встроены в компонент как inline SVG:
- **LibraryIcon** - Аналитика/библиотека (20×20 viewBox)
- **SettingsIcon** - Шестерёнка настроек (19.91×22 viewBox)
- **BookIcon** - Открытая книга для FAB (22×20 viewBox)
- **CurveBackground** - Фоновая кривая (393×107 viewBox)

---

## ✅ Checklist миграции

Если переходите со старого bottom-nav:

- [x] `bottom-nav.tsx` теперь re-export
- [x] Все SVG пути встроены (не нужны imports)
- [x] Токены вынесены в отдельный файл
- [x] Типы вынесены в отдельный файл
- [x] Добавлена поддержка Liquid Glass
- [x] Добавлены ARIA атрибуты
- [x] Темизация через CSS переменные
- [x] Legacy совместимость сохранена

---

## 🔧 Troubleshooting

**Проблема:** Иконки не отображаются
- ✅ Убедитесь, что CSS переменные определены в theme.css
- ✅ Проверьте, что `.dark` класс применяется к `<html>`

**Проблема:** FAB не кликается
- ✅ Передайте `activeBookId` prop
- ✅ Проверьте, что роутер настроен правильно

**Проблема:** Liquid Glass не работает
- ✅ Проверьте поддержку backdrop-filter в браузере
- ✅ Добавьте класс `.glass` к контейнеру
