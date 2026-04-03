export const CONFIG = {
  // Google Sheets
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1c7qh82G6BrGqbocCNckmCg8kPvNgv7MzmVjLM9eyeNA/edit?usp=sharing',
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbz_evcY2kTxVGU3bNV-J-83txC7HPyGbiVpUKnFWv7yAQPrXWJ2n038AD_z2gOjTFWWag/exec',

  // Sheet names
  SHEETS: {
    DATABASE: 'База данных',
    EDITING: 'Файл редактирования',
  },

  // Scoring
  REVENUE_POINTS_PER_50000: 5,

  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут
  CACHE_KEY: 'league_participants_cache',

  // Logs
  LOG_STORAGE_KEY: 'competition_logs',
  MAX_LOGS: 1000,

  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,

  // Admin
  ADMIN_PASSWORD: 'your_password', // Измени на свой!
  ADMIN_SHORTCUT: 'ctrl+shift+a',
} as const;

export type ConfigType = typeof CONFIG;
