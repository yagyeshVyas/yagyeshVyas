const fs = require('fs');

const W = 900, H = 1080;

// Spark particles
const sparks = [
  [200,550,'#22d3ee',3.4],[350,480,'#a78bfa',3.5],[500,400,'#f472b6',3.6],
  [650,320,'#fbbf24',3.7],[150,620,'#fff',3.5],[400,580,'#22d3ee',3.6],
  [700,280,'#a78bfa',3.8],[550,520,'#f472b6',3.9],[250,450,'#fbbf24',4.0],
  [600,600,'#22d3ee',4.1],[300,700,'#a78bfa',3.9],[750,650,'#f472b6',4.2],
];
const sparkSvg = sparks.map(([x,y,c,delay]) => {
  const dx = x > 450 ? 60 : -60;
  const dy = -80;
  return `<circle cx="${x}" cy="${y}" r="2.5" fill="${c}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="0.8s" begin="${delay}s" fill="freeze"/><animate attributeName="cx" values="${x};${x+dx}" dur="0.8s" begin="${delay}s" fill="freeze"/><animate attributeName="cy" values="${y};${y+dy}" dur="0.8s" begin="${delay}s" fill="freeze"/></circle>`;
}).join('\n');

// Profile reveal elements - each fades in at different times (5s onward)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="auto" role="img" aria-label="Yagyesh Vyas — AI/ML Engineer">
  <defs>
    <linearGradient id="sG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="40%" stop-color="#22d3ee" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="60%" stop-color="#a78bfa" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="nG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="fG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bR" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="15%" stop-color="#22d3ee" stop-opacity="0.6"/>
      <stop offset="40%" stop-color="#a78bfa" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0b0f1e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mG" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <filter id="gF" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="fr"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <style>
    @media (prefers-reduced-motion: reduce){animate,animateTransform,set{display:none!important}*{opacity:1!important}}
  </style>

  <g clip-path="url(#fr)">

    <!-- ============ LAYER 1: PROFILE CONTENT (always there, revealed later) ============ -->
    <rect width="${W}" height="${H}" fill="#0b0f1e"/>

    <g opacity="0.04" stroke="#22d3ee" stroke-width="0.5">
      <path d="M0 50H${W}M0 100H${W}M0 150H${W}M0 200H${W}M0 250H${W}M0 300H${W}M0 350H${W}M0 400H${W}M0 450H${W}M0 500H${W}M0 550H${W}M0 600H${W}M0 650H${W}M0 700H${W}M0 750H${W}M0 800H${W}M0 850H${W}M0 900H${W}M0 950H${W}M0 1000H${W}"/>
      <path d="M90 0V${H}M180 0V${H}M270 0V${H}M360 0V${H}M450 0V${H}M540 0V${H}M630 0V${H}M720 0V${H}M810 0V${H}"/>
    </g>

    <!-- Moon -->
    <circle cx="700" cy="150" r="80" fill="url(#mG)"/>
    <circle cx="700" cy="150" r="40" fill="#fbbf24" opacity="0.06"/>

    <!-- Ambient glow behind name -->
    <circle cx="450" cy="450" r="300" fill="url(#bR)" opacity="0.03"/>

    <!-- Name -->
    <text x="450" y="420" font-family="Segoe UI,Inter,sans-serif" font-size="52" font-weight="800" fill="url(#nG)" text-anchor="middle" opacity="0">
      Yagyesh Vyas
      <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.4;1" dur="1s" begin="5s" fill="freeze"/>
    </text>

    <!-- Title -->
    <text x="450" y="460" font-family="JetBrains Mono,monospace" font-size="16" fill="#22d3ee" text-anchor="middle" letter-spacing="4" opacity="0">
      AI / ML ENGINEER
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="5.8s" fill="freeze"/>
    </text>

    <!-- Subtitle -->
    <text x="450" y="490" font-family="Segoe UI,Inter,sans-serif" font-size="14" fill="#64748b" text-anchor="middle" opacity="0">
      LLM and Generative AI Systems
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="6.2s" fill="freeze"/>
    </text>

    <!-- Accent line -->
    <rect x="200" y="520" width="0" height="2" rx="1" fill="url(#nG)" opacity="0">
      <animate attributeName="width" values="0;500" dur="0.9s" begin="6.5s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0.6" dur="0.2s" begin="6.5s" fill="freeze"/>
    </rect>

    <!-- Stats -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="7s" fill="freeze"/>
      <text x="280" y="570" font-family="JetBrains Mono,monospace" font-size="14" fill="#a78bfa" text-anchor="middle" font-weight="700">118</text>
      <text x="280" y="590" font-family="Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">stars earned</text>
      <text x="450" y="570" font-family="JetBrains Mono,monospace" font-size="14" fill="#22d3ee" text-anchor="middle" font-weight="700">764</text>
      <text x="450" y="590" font-family="Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">security rules</text>
      <text x="620" y="570" font-family="JetBrains Mono,monospace" font-size="14" fill="#f472b6" text-anchor="middle" font-weight="700">10</text>
      <text x="620" y="590" font-family="Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">open source repos</text>
    </g>

    <!-- Skill tags -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="7.4s" fill="freeze"/>
      <rect x="220" y="630" width="70" height="22" rx="11" fill="#0b0f1e" stroke="#22d3ee" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="255" y="645" font-family="JetBrains Mono,monospace" font-size="10" fill="#22d3ee" text-anchor="middle">LangChain</text>
      <rect x="300" y="630" width="56" height="22" rx="11" fill="#0b0f1e" stroke="#a78bfa" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="328" y="645" font-family="JetBrains Mono,monospace" font-size="10" fill="#a78bfa" text-anchor="middle">LoRA</text>
      <rect x="366" y="630" width="48" height="22" rx="11" fill="#0b0f1e" stroke="#f472b6" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="390" y="645" font-family="JetBrains Mono,monospace" font-size="10" fill="#f472b6" text-anchor="middle">RAG</text>
      <rect x="424" y="630" width="70" height="22" rx="11" fill="#0b0f1e" stroke="#fbbf24" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="459" y="645" font-family="JetBrains Mono,monospace" font-size="10" fill="#fbbf24" text-anchor="middle">Python</text>
      <rect x="504" y="630" width="76" height="22" rx="11" fill="#0b0f1e" stroke="#34d399" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="542" y="645" font-family="JetBrains Mono,monospace" font-size="10" fill="#34d399" text-anchor="middle">PyTorch</text>
      <rect x="590" y="630" width="72" height="22" rx="11" fill="#0b0f1e" stroke="#22d3ee" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="626" y="645" font-family="JetBrains Mono,monospace" font-size="10" fill="#22d3ee" text-anchor="middle">Ollama</text>
    </g>

    <!-- Scroll hint -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="8s" fill="freeze"/>
      <text x="450" y="820" font-family="JetBrains Mono,monospace" font-size="13" fill="#475569" text-anchor="middle" letter-spacing="2">scroll for more</text>
      <path d="M440,840 L450,850 L460,840 M440,850 L450,860 L460,850" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    </g>

    <!-- Remaining slash scar -->
    <path d="M50,650 Q300,450 850,250" fill="none" stroke="url(#sG)" stroke-width="1" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity="0">
      <animate attributeName="stroke-dashoffset" values="100;0" dur="0.5s" begin="4.5s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0.08" dur="0.3s" begin="4.5s" fill="freeze"/>
    </path>

    <!-- ============ LAYER 2: DARKNESS (fades away at 4.5s) ============ -->
    <rect width="${W}" height="${H}" fill="#050810" opacity="1">
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.9;1" dur="5s" fill="freeze"/>
    </rect>

    <!-- Grid in darkness -->
    <g opacity="0.5" stroke="#22d3ee" stroke-width="0.5">
      <path d="M0 50H${W}M0 100H${W}M0 150H${W}M0 200H${W}M0 250H${W}M0 300H${W}M0 350H${W}M0 400H${W}M0 450H${W}M0 500H${W}M0 550H${W}M0 600H${W}M0 650H${W}M0 700H${W}M0 750H${W}M0 800H${W}M0 850H${W}M0 900H${W}M0 950H${W}M0 1000H${W}" opacity="0.08"/>
      <path d="M90 0V${H}M180 0V${H}M270 0V${H}M360 0V${H}M450 0V${H}M540 0V${H}M630 0V${H}M720 0V${H}M810 0V${H}" opacity="0.08"/>
    </g>

    <!-- ============ FRAME 01: BLACK (0-1.5s) ============ -->
    <!-- Kanji -->
    <text x="450" y="450" font-family="serif" font-size="80" font-weight="700" fill="#1b2340" text-anchor="middle" opacity="0">
      <animate attributeName="opacity" values="0;0.4" dur="1.2s" begin="0.3s" fill="freeze"/>
      <animate attributeName="opacity" values="0.4;0" dur="0.3s" begin="1.5s" fill="freeze"/>
    </text>
    <text x="450" y="500" font-family="serif" font-size="16" fill="#1b2340" text-anchor="middle" opacity="0">
      <animate attributeName="opacity" values="0;0.3" dur="1s" begin="0.6s" fill="freeze"/>
      <animate attributeName="opacity" values="0.3;0" dur="0.3s" begin="1.5s" fill="freeze"/>
    </text>

    <!-- ============ FRAME 02: SWORD DRAW (1.5-3.2s) ============ -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.1s" begin="1.5s" fill="freeze"/>
      <animate attributeName="opacity" values="1;0" dur="0.4s" begin="3.3s" fill="freeze"/>

      <!-- Glow trail -->
      <path d="M50,650 Q300,450 850,250" fill="none" stroke="#22d3ee" stroke-width="14" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity="0.4" filter="url(#gF)">
        <animate attributeName="stroke-dashoffset" values="100;0" dur="1.5s" begin="1.6s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.3 1"/>
      </path>
      <!-- Blade -->
      <path d="M50,650 Q300,450 850,250" fill="none" stroke="url(#bG)" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" filter="url(#gF)">
        <animate attributeName="stroke-dashoffset" values="100;0" dur="1.5s" begin="1.6s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.3 1"/>
      </path>
      <!-- Guard -->
      <circle cx="50" cy="650" r="9" fill="#1b2340" stroke="#fbbf24" stroke-width="2" opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.1s" begin="1.6s" fill="freeze"/>
      </circle>
      <!-- Handle -->
      <rect x="20" y="647" width="40" height="6" rx="3" fill="#1b2340" opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.1s" begin="1.6s" fill="freeze"/>
      </rect>
      <!-- Handle wrap -->
      <g stroke="#fbbf24" stroke-width="0.8" opacity="0">
        <animate attributeName="opacity" values="0;0.4" dur="0.1s" begin="1.6s" fill="freeze"/>
        <line x1="25" y1="647" x2="25" y2="653"/>
        <line x1="32" y1="647" x2="32" y2="653"/>
        <line x1="39" y1="647" x2="39" y2="653"/>
        <line x1="46" y1="647" x2="46" y2="653"/>
        <line x1="53" y1="647" x2="53" y2="653"/>
      </g>
    </g>

    <!-- ============ FRAME 03: THE SLASH (3.2-4.2s) ============ -->

    <!-- Cut line -->
    <path d="M50,650 Q300,450 850,250" fill="none" stroke="url(#sG)" stroke-width="2" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.1s" begin="3.3s" fill="freeze"/>
      <animate attributeName="stroke-dashoffset" values="100;0" dur="0.4s" begin="3.3s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1"/>
      <animate attributeName="stroke-width" values="2;18;4" dur="0.7s" begin="3.3s" fill="freeze"/>
      <animate attributeName="opacity" values="1;0.15" dur="0.7s" begin="3.8s" fill="freeze"/>
    </path>

    <!-- White burst -->
    <circle cx="450" cy="450" r="0" fill="url(#bR)" filter="url(#gF)">
      <animate attributeName="r" values="0;500;600" dur="0.7s" begin="3.4s" fill="freeze" calcMode="spline" keySplines="0.1 0 0.1 1"/>
      <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="3.4s" fill="freeze"/>
    </circle>
    <circle cx="450" cy="450" r="0" fill="#fff" filter="url(#gF)">
      <animate attributeName="r" values="0;100;140" dur="0.4s" begin="3.4s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0.95;0" dur="0.6s" begin="3.4s" fill="freeze"/>
    </circle>

    <!-- Sparks -->
    <g filter="url(#gF)">
      ${sparkSvg}
    </g>

    <!-- Screen flash -->
    <rect width="${W}" height="${H}" fill="#fff" opacity="0">
      <animate attributeName="opacity" values="0;0.9;0" dur="0.5s" begin="3.4s" fill="freeze"/>
    </rect>

    <!-- Crack lines -->
    <g stroke="#22d3ee" stroke-width="1.5" fill="none" opacity="0" filter="url(#gF)">
      <animate attributeName="opacity" values="0;0.5;0" dur="0.8s" begin="3.5s" fill="freeze"/>
      <path d="M450,450 L150,150"/>
      <path d="M450,450 L750,80"/>
      <path d="M450,450 L50,800"/>
      <path d="M450,450 L820,750"/>
      <path d="M450,450 L300,950"/>
      <path d="M450,450 L600,200"/>
    </g>

    <rect x="0" y="${H-2}" width="${W}" height="2" fill="url(#fG)" opacity="0">
      <animate attributeName="opacity" values="0;0.3" dur="0.5s" begin="8s" fill="freeze"/>
      <animate attributeName="width" values="0;${W}" dur="1s" begin="8s" fill="freeze"/>
    </rect>

  </g>
</svg>`;

fs.writeFileSync('assets/intro.svg', svg);
console.log('intro.svg — ' + W + 'x' + H + ', single play, no loop');
