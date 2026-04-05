# Bottom Bar Component

Централизованный компонент нижней навигации для iOS MVP ридера FB2-книг.

## 📁 Файловая структура

```
/src/app/components/
├── bottom-bar.tsx       # Основной компонент (новый)
└── bottom-nav.tsx       # Legacy re-export для обратной совместимости
```

## 🎨 Что включено

### 1. **Встроенные SVG иконки**
- `LibraryIcon` - иконка библиотеки (аналитика)
- `SettingsIcon` - иконка настроек (шестерёнка)
- `BookIcon` - иконка книги (для FAB)
- `CurveBackground` - фоновая кривая навигации

### 2. **Design Tokens**
```typescript
const BOTTOM_BAR_TOKENS = {
  // Heights
  containerHeight: 108,
  navHeight: 75,
  curveHeight: 107,
  curveTop: -32,

  // FAB (Floating Action Button)
  fabSize: 56,
  fabTop: -22,
  fabShadow: "0px 4px 12px 0px rgba(97,62,234,0.5)",
  fabOpacity: 0.8,

  // Icon sizes
  iconSize: 24,
  iconInset: "8.33%",

  // Colors
  activeColor: "#9E77ED",
  activeTextColor: "#b692f6",
  inactiveBg: "#7f56d9",

  // Typography
  labelFontSize: "12px",
  labelLineHeight: "18px",
  labelFontFamily: "'Inter',sans-serif",
}
```

### 3. **CSS переменные из theme.css**
Компонент использует CSS-переменные для адаптивной темы:
- `--app-nav-bg` - фон навигации
- `--app-icon-muted` - неактивные иконки
- `--app-text-muted` - неактивный текст
- `--app-text-secondary` - вторичный текст

### 4. **Liquid Glass эффект**
В `theme.css` добавлен класс `.glass`:
```css
.glass {
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  background-color: rgba(245, 245, 245, 0.7);
}

.dark .glass {
  background-color: rgba(12, 14, 18, 0.7);
}
```

## 🚀 Использование

### Базовое использование
```tsx
import { BottomBar } from "./components/bottom-bar";

function RootLayout() {
  const activeBookId = "book-123";
  
  return (
    <div>
      {/* Main content */}
      <BottomBar activeBookId={activeBookId} />
    </div>
  );
}
```

### С эффектом Liquid Glass
```tsx
// Добавить класс "glass" к контейнеру бара
// Вариант 1: Обернуть компонент
<div className="glass">
  <BottomBar activeBookId={activeBookId} />
</div>

// Вариант 2: Модифицировать компонент изнутри
// В bottom-bar.tsx добавить className="glass" к основному контейнеру:
<div className="relative shrink-0 w-full glass" ...>
```

### Legacy совместимость
```tsx
// Старый импорт продолжит работать
import { BottomNav } from "./components/bottom-nav";

<BottomNav activeBookId={activeBookId} />
```

## 📊 Архитектура

### Props
```typescript
interface BottomBarProps {
  activeBookId?: string; // ID текущей активной книги для FAB
}
```

### Навигация
Компонент автоматически определяет активный маршрут через `useLocation()`:
- `/` или `/library` → активна кнопка Library
- `/book/:id` → активна центральная кнопка Book
- `/settings` → активна кнопка Settings

### Accessibility
- `aria-label` на кнопках
- `aria-current="page"` для активных маршрутов
- `disabled` состояние на FAB когда `activeBookId` отсутствует

## 🎯 Особенности

### Floating Action Button (FAB)
- Размер: 56×56px
- Позиция: центр, -22px от верхнего края бара
- Тень: фиолетовое свечение
- Навигация к книге только при наличии `activeBookId`

### Адаптивная тема
Цвета автоматически переключаются между light/dark mode через CSS переменные:
```css
/* Light mode */
--app-nav-bg: #F5F5F5;
--app-icon-muted: #717680;

/* Dark mode (.dark) */
--app-nav-bg: #0C0E12;
--app-icon-muted: #A4A7AE;
```

## 🔧 Кастомизация

### Изменить цвета активного состояния
```typescript
// В BOTTOM_BAR_TOKENS
activeColor: "#YOUR_COLOR",
activeTextColor: "#YOUR_TEXT_COLOR",
```

### Изменить размер FAB
```typescript
// В BOTTOM_BAR_TOKENS
fabSize: 64, // вместо 56
fabTop: -26, // вместо -22
```

### Добавить новую кнопку
```tsx
<button
  onClick={() => navigate("/new-route")}
  className="flex-1 flex flex-col gap-3 items-center justify-center px-4 py-3 h-full"
>
  {/* Your icon */}
  <span>Label</span>
</button>
```

## 📦 Зависимости
- `react-router` - навигация
- `theme.css` - CSS переменные для темы
- Встроенные SVG (нет внешних зависимостей)

## 🌟 Преимущества новой структуры

1. **Единый источник истины** - все иконки, токены и стили в одном файле
2. **Type-safe токены** - константы с TypeScript типами
3. **Нет внешних SVG** - встроенные иконки, меньше HTTP запросов
4. **Темизация** - полная поддержка light/dark через CSS переменные
5. **Accessibility** - ARIA атрибуты из коробки
6. **Liquid Glass ready** - готовый CSS класс для эффекта
7. **Обратная совместимость** - legacy импорт работает через re-export

## 🔄 Миграция

Если вы используете старый `bottom-nav.tsx`:

**До:**
```tsx
import { BottomNav } from "./components/bottom-nav";
```

**После (рекомендуется):**
```tsx
import { BottomBar } from "./components/bottom-bar";
```

**Или оставить как есть** - `bottom-nav.tsx` теперь просто re-export.
