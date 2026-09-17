// Declarations for modules without types
declare module 'next-themes'
declare module 'code-stash'

// TypeScript 6+ treats CSS side-effect imports as errors unless they have
// an ambient module declaration (see noUncheckedSideEffectImports).
declare module '*.css' {}
