// Constants and static configuration data
// This file contains data that never changes at runtime

// Chrome command-line arguments for optimal performance in containers
const CHROME_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
  '--disable-features=VizDisplayCompositor',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-field-trial-config',
  '--disable-back-forward-cache',
  '--disable-ipc-flooding-protection',
  '--max_old_space_size=256'
];

// Emojis for user identification/decoration
const EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
  '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
  '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢',
  '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡',
  '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓',
  '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃',
  '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕',
  '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢',
  '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀',
  '🐿️', '🦔', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱',
  '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚',
  '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞',
  '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒',
  '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨',
  '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️',
  '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️',
  '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️', '🍏', '🍎', '🍐',
  '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭',
  '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
  '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖',
  '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗'
];

// Memory profiles define safe operating limits for different machine sizes
const MEMORY_PROFILES = {
  '8GB': {
    maxMemoryMB: 6500,
    memoryThreshold: 0.85,
    maxConcurrency: 20,
    maxBrowsers: 25,
    rampUpPercentages: [0.20, 0.40, 0.60, 1.0]
  },
  '16GB': {
    maxMemoryMB: 13000,
    memoryThreshold: 0.85,
    maxConcurrency: 80,
    maxBrowsers: 60,
    rampUpPercentages: [0.10, 0.25, 0.50, 0.75, 1.0]
  },
  '32GB': {
    maxMemoryMB: 26000,
    memoryThreshold: 0.85,
    maxConcurrency: 100,
    maxBrowsers: 80,
    rampUpPercentages: [0.10, 0.30, 0.60, 1.0]
  }
};

module.exports = {
  CHROME_ARGS,
  EMOJIS,
  MEMORY_PROFILES
};

