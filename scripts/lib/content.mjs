// Curated copy, positions and groupings. Data comes from the API; judgement lives here.

export const USER = 'yagyeshVyas';

export const REPO_COPY = {
  personalforge: {
    blurb:
      'Fine-tune any open model on your own documents. LoRA + RAG + GGUF export, no coding, entirely offline.',
    short: 'Offline LLM forge: LoRA + RAG + GGUF.',
    chips: ['LoRA', 'RAG', 'GGUF'],
  },
  VibeGuard: {
    blurb:
      'Offline scanner and runtime firewall for AI-written code. Hundreds of rules, MCP tooling, signed approvals, zero telemetry.',
    short: 'Offline scanner + runtime firewall for AI code.',
    chips: ['SAST', 'MCP', 'SANDBOX'],
  },
  'linkedin-scraper': {
    blurb: 'Playwright automation for recruiter-grade LinkedIn extraction.',
    short: 'Playwright extraction for recruiters.',
    chips: ['PLAYWRIGHT', 'PYTHON'],
  },
  chromex: {
    blurb: 'Native iOS browser with a Chrome-compatible extension runtime.',
    short: 'Native iOS browser with Chrome extensions.',
    chips: ['SWIFT', 'iOS'],
  },
  'glance-ai': {
    blurb: 'Interview copilot that hears, reads and answers in an overlay that screen capture misses.',
    short: 'Undetectable interview copilot for Windows.',
    chips: ['ELECTRON', 'OCR'],
  },
  'retrogame-boy': {
    blurb: 'LAN-only retro console: Android TV emulator plus a Flutter controller.',
    short: 'LAN-only retro console + Flutter controller.',
    chips: ['FLUTTER', 'LIBRETRO'],
  },
  'AI-Career-Suite': {
    blurb: 'Resume analyzer that scores, rewrites and matches ATS keywords.',
    short: 'ATS-aware resume analyzer and rewriter.',
    chips: ['STREAMLIT', 'LLM'],
  },
  yagyeshVyas: {
    blurb: 'This page — a hand-built SVG console, generated from live GitHub data.',
    short: 'This profile — hand-built SVG, live data.',
    chips: ['SVG', 'CI'],
  },
};

// Manual placement keeps the constellation legible. Unknown repos fall back to
// a deterministic golden-angle orbit, so new repositories still appear.
export const CONSTELLATION = {
  personalforge: { x: 318, y: 170, side: 'right' },
  VibeGuard: { x: 706, y: 150, side: 'right' },
  'linkedin-scraper': { x: 812, y: 262, side: 'left' },
  chromex: { x: 688, y: 366, side: 'right' },
  'glance-ai': { x: 468, y: 398, side: 'below' },
  'retrogame-boy': { x: 276, y: 350, side: 'left' },
  'AI-Career-Suite': { x: 160, y: 232, side: 'right' },
};

export const FLAGSHIPS = ['personalforge', 'VibeGuard'];

export const TOOLBOX = [
  {
    title: 'AI / ML',
    items: ['Python', 'PyTorch', 'Hugging Face', 'LoRA fine-tuning', 'RAG · ChromaDB', 'GGUF export'],
  },
  {
    title: 'ENGINEERING',
    items: ['JavaScript', 'Node.js', 'Electron', 'Playwright', 'Streamlit', 'GitHub Actions'],
  },
  {
    title: 'SECURITY',
    items: ['SAST', 'Prompt injection', 'MCP firewall', 'AppContainer', 'SARIF', 'Secret scanning'],
  },
  {
    title: 'MOBILE / WEB',
    items: ['Swift', 'Flutter', 'HTML / CSS', 'Browser extensions', 'IPA via CI', 'Windows'],
  },
];

export const LINKS = [
  {
    id: 'github',
    label: 'GitHub',
    handle: '@yagyeshVyas',
    href: 'https://github.com/yagyeshVyas',
    accent: '#4EF0C0',
    mark: 'GH',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/yagyeshvyas',
    href: 'https://linkedin.com/in/yagyeshvyas',
    accent: '#7EA2FF',
    mark: 'in',
  },
  {
    id: 'npm',
    label: 'npm',
    handle: '~yagyeshvyas',
    href: 'https://www.npmjs.com/~yagyeshvyas',
    accent: '#F5C778',
    mark: 'npm',
  },
];

export const PORTFOLIO = 'https://yagyesh-portfolio.vercel.app';
export const CONSTELLATION_URL = 'https://yagyeshvyas.github.io/yagyeshVyas/';

export const TICKER = [
  'LLM FINE-TUNING',
  'RAG PIPELINES',
  'LoRA TUNING',
  'GGUF',
  'LOCAL INFERENCE',
  'AI SECURITY',
  'MCP SERVERS',
  'BROWSER AUTOMATION',
  'SWIFT / iOS',
  'FLUTTER',
  'PLAYWRIGHT',
  'PYTHON',
  'ELECTRON',
  'ZERO TELEMETRY',
  'OFFLINE-FIRST',
];
