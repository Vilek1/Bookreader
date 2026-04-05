# Figma Tokens Integration

## Current state
- Light and dark Figma color token exports are now connected to the app theme layer.
- Spacing, radius, and typography are now mapped from the root CSS token exports.
- The app now reads tokens through `useAppTheme()` so new screens follow the same design system automatically.

## Rules
- Do not hardcode new colors, spacing, radii, or typography values outside the token layer.
- Map exported Figma token names into `src/modules/theme/tokens/theme.ts`.
- Read styles in components through `src/modules/theme/ThemeProvider.tsx`.
- Keep component styling dependent on token references only.

## Expected next input
- Figma component structure through MCP
- Screenshots for states such as no-cover fallback
