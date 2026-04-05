/**
 * Bottom Bar - Примеры использования
 * 
 * Этот файл демонстрирует различные способы использования
 * компонента BottomBar и его токенов
 */

import { BottomBar } from "./bottom-bar";
import { BOTTOM_BAR_TOKENS, LIQUID_GLASS_CLASS } from "./bottom-bar-tokens";

// =============================================
// Пример 1: Базовое использование
// =============================================

export function Example1BasicUsage() {
  const currentBookId = "book-123";
  
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, padding: "2rem" }}>
        <h1>My Book Reader</h1>
        <p>Content goes here...</p>
      </main>
      
      {/* Базовый bottom bar */}
      <BottomBar activeBookId={currentBookId} />
    </div>
  );
}

// =============================================
// Пример 2: С Liquid Glass эффектом
// =============================================

export function Example2WithLiquidGlass() {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <main style={{ paddingBottom: BOTTOM_BAR_TOKENS.containerHeight }}>
        <h1>Content</h1>
      </main>
      
      {/* Fixed bottom bar с glass эффектом */}
      <div 
        className={LIQUID_GLASS_CLASS}
        style={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 50 
        }}
      >
        <BottomBar activeBookId="book-456" />
      </div>
    </div>
  );
}

// =============================================
// Пример 3: Кастомный стиль с токенами
// =============================================

export function Example3CustomStyling() {
  return (
    <div>
      {/* Используем токены для кастомного контейнера */}
      <div 
        style={{
          marginTop: "auto",
          background: "linear-gradient(to top, var(--app-nav-bg), transparent)",
          paddingTop: BOTTOM_BAR_TOKENS.fabSize / 2,
        }}
      >
        <BottomBar />
      </div>
      
      {/* Индикатор использующий токены */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: BOTTOM_BAR_TOKENS.iconSize,
          height: BOTTOM_BAR_TOKENS.iconSize,
          borderRadius: "50%",
          backgroundColor: BOTTOM_BAR_TOKENS.activeColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: BOTTOM_BAR_TOKENS.labelFontSize,
        }}
      >
        3
      </div>
    </div>
  );
}

// =============================================
// Пример 4: Динамический activeBookId
// =============================================

export function Example4DynamicBook() {
  // В реальном приложении получаем из стейта
  const books = [
    { id: "book-1", title: "War and Peace" },
    { id: "book-2", title: "Anna Karenina" },
  ];
  
  const currentBookIndex = 0;
  const currentBook = books[currentBookIndex];
  
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={{ padding: "1rem", borderBottom: "1px solid var(--app-border)" }}>
        <h2>{currentBook.title}</h2>
      </header>
      
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Book content */}
      </main>
      
      <BottomBar activeBookId={currentBook.id} />
    </div>
  );
}

// =============================================
// Пример 5: Адаптивный паддинг с токенами
// =============================================

export function Example5ResponsivePadding() {
  return (
    <div 
      style={{ 
        minHeight: "100vh",
        // Паддинг снизу равен высоте бара
        paddingBottom: BOTTOM_BAR_TOKENS.containerHeight,
      }}
    >
      <main style={{ padding: "2rem" }}>
        <h1>Content with safe area</h1>
        <p>Этот контент не перекрывается bottom bar</p>
        
        {/* Демонстрация всех токенов */}
        <div style={{ marginTop: "2rem", fontFamily: "monospace", fontSize: "12px" }}>
          <h3>Активные токены:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>containerHeight: {BOTTOM_BAR_TOKENS.containerHeight}px</li>
            <li>navHeight: {BOTTOM_BAR_TOKENS.navHeight}px</li>
            <li>fabSize: {BOTTOM_BAR_TOKENS.fabSize}px</li>
            <li>iconSize: {BOTTOM_BAR_TOKENS.iconSize}px</li>
            <li>activeColor: {BOTTOM_BAR_TOKENS.activeColor}</li>
            <li>labelFontSize: {BOTTOM_BAR_TOKENS.labelFontSize}</li>
          </ul>
        </div>
      </main>
      
      {/* Fixed bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <BottomBar />
      </div>
    </div>
  );
}

// =============================================
// Пример 6: Кастомный FAB индикатор
// =============================================

export function Example6CustomFABIndicator() {
  const hasUnreadChapters = true;
  
  return (
    <div style={{ position: "relative" }}>
      <BottomBar activeBookId="book-789" />
      
      {/* Красная точка-индикатор над FAB */}
      {hasUnreadChapters && (
        <div
          style={{
            position: "fixed",
            bottom: BOTTOM_BAR_TOKENS.containerHeight - BOTTOM_BAR_TOKENS.fabTop,
            left: "50%",
            transform: "translateX(50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#EF4444",
            border: "2px solid var(--app-nav-bg)",
            zIndex: 60,
          }}
        />
      )}
    </div>
  );
}

// =============================================
// Пример 7: Integration с Router
// =============================================

export function Example7WithRouter() {
  // В реальном приложении используйте useLocation из react-router
  
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ 
        padding: "1rem", 
        backgroundColor: "var(--app-bg-card)",
        borderBottom: "1px solid var(--app-border)"
      }}>
        <h1 style={{ margin: 0, fontSize: BOTTOM_BAR_TOKENS.labelFontSize }}>
          FB2 Reader
        </h1>
      </header>
      
      {/* Main content */}
      <main style={{ 
        flex: 1, 
        overflow: "auto",
        backgroundColor: "var(--app-bg)"
      }}>
        {/* Router Outlet здесь */}
      </main>
      
      {/* Bottom navigation */}
      <BottomBar activeBookId="current-book-id" />
    </div>
  );
}

// =============================================
// Экспорт всех примеров
// =============================================

export const BottomBarExamples = {
  Example1BasicUsage,
  Example2WithLiquidGlass,
  Example3CustomStyling,
  Example4DynamicBook,
  Example5ResponsivePadding,
  Example6CustomFABIndicator,
  Example7WithRouter,
};
