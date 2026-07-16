const fs = require('fs');

const sparks = [];
const sparkData = [
  [200,450,'#22d3ee',3.4],[350,400,'#a78bfa',3.5],[500,300,'#f472b6',3.6],
  [650,250,'#fbbf24',3.7],[150,500,'#fff',3.5],[400,500,'#22d3ee',3.6],
  [700,200,'#a78bfa',3.8],[550,450,'#f472b6',3.9],[250,350,'#fbbf24',4.0]
];
sparkData.forEach(([x,y,c,delay],i) => {
  sparks.push(`<circle cx="${x}" cy="${y}" r="2" fill="${c}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="0.7s" begin="${delay}s" fill="freeze"/><animate attributeName="cy" values="${y};${y-70}" dur="0.7s" begin="${delay}s" fill="freeze"/><animate attributeName="cx" values="${x};${x>450?x+40:x-40}" dur="0.7s" begin="${delay}s" fill="freeze"/></circle>`);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" width="100%" height="auto" role="img" aria-label="Enter profile">
  <defs>
    <linearGradient id="iSlash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="40%" stop-color="#22d3ee" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="60%" stop-color="#a78bfa" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="iBlade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="iName" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="iFoot" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="iBurst" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="20%" stop-color="#22d3ee" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#a78bfa" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0b0f1e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="iMoon" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <filter id="iGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="iFrame"><rect width="900" height="700" rx="14"/></clipPath>
  </defs>
  <style>
    @media (prefers-reduced-motion: reduce){
      animate,animateTransform,set{display:none!important}
      *{opacity:1!important}
    }
  </style>

  <g clip-path="url(#iFrame)">
    <rect width="900" height="700" fill="#050810"/>

    <g opacity="0.04" stroke="#22d3ee" stroke-width="0.5">
      <path d="M0 50H900M0 100H900M0 150H900M0 200H900M0 250H900M0 300H900M0 350H900M0 400H900M0 450H900M0 500H900M0 550H900M0 600H900M0 650H900"/>
      <path d="M90 0V700M180 0V700M270 0V700M360 0V700M450 0V700M540 0V700M630 0V700M720 0V700M810 0V700"/>
    </g>

    <circle cx="700" cy="120" r="70" fill="url(#iMoon"><animate attributeName="r" values="65;75;65" dur="6s" repeatCount="indefinite"/></circle>
    <circle cx="700" cy="120" r="35" fill="#fbbf24" opacity="0.08"><animate attributeName="opacity" values="0.06;0.12;0.06" dur="4s" repeatCount="indefinite"/></circle>

    <g fill="#22d3ee" opacity="0.3">
      <circle cx="150" cy="200" r="1"><animate attributeName="cy" values="200;180;200" dur="5s" repeatCount="indefinite"/></circle>
      <circle cx="300" cy="300" r="1.5"><animate attributeName="cy" values="300;280;300" dur="6s" repeatCount="indefinite"/></circle>
      <circle cx="500" cy="250" r="1"><animate attributeName="cy" values="250;230;250" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="650" cy="400" r="1.2"><animate attributeName="cy" values="400;380;400" dur="7s" repeatCount="indefinite"/></circle>
      <circle cx="200" cy="500" r="1"><animate attributeName="cy" values="500;480;500" dur="5s" repeatCount="indefinite"/></circle>
      <circle cx="750" cy="300" r="1.3"><animate attributeName="cy" values="300;280;300" dur="6s" repeatCount="indefinite"/></circle>
      <circle cx="400" cy="450"-opacity="0.3"><animate attributeName="cy" values="450;430;450" dur="4.5s" repeatCount="indefinite"/></circle>
      <circle cx="100" cy="400" r="1.5"><animate attributeName="cy" values="400;380;400" dur="5.5s" repeatCount="indefinite"/></circle>
    </g>

    <!-- KANJI -->
    <text x="450" y="280" font-family="serif" font-size="72" font-weight="700" fill="#1b2340" text-anchor="middle" opacity="0">
      <animate attributeName="opacity" values="0;0.5" dur="1.5s" begin="0.3s" fill="freeze"/>
      <animate attributeName="opacity" values="0.5;0" dur="0.4s" begin="2s" fill="freeze"/>
    </text>

    <!-- SWORD DRAW -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.1s" begin="2s" fill="freeze"/>
      <animate attributeName="opacity" values="1;0" dur="0.3s" begin="3.5s" fill="freeze"/>
      <path d="M50,550 Q300,350 850,150" fill="none" stroke="#22d3ee" stroke-width="12" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity="0.4" filter="url(#iGlow)">
        <animate attributeName="!s" values="100;0" dur="1.3s" begin="2.1s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.3 1"/>
      </path>
      <path d="M50,550 Q300,350 850,150" fill="none" stroke="url(#iBlade)" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" filter="url(#iGlow)">
        <animate attributeName="stroke-dashoffset" values="100;0" dur="1.3s" begin="2.1s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.3 1"/>
      </path>
      <circle cx="50" cy="550" r="8" fill="#1b2340" stroke="#fbbf24" stroke-width="2" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.1s" begin="2.1s" fill="freeze"/></circle>
      <rect x="25" y="547" width="35" height="6" rx="3" fill="#1b2340" opacity="0"><animate attributeName="opacity" values="0;1" dur="0.1s" begin="2.1s" fill="freeze"/></rect>
    </g>

    <!-- SLASH BURST -->
    <path d="M50,550 Q300,350 850,150" fill="none" stroke="url(#iSlash)" stroke-width="2" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.1s" begin="3.3s" fill="freeze"/>
      <animate attributeName="stroke-dashoffset" values="100;0" dur="0.4s" begin="3.3s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.1 1"/>
      <animate attributeName="stroke-width" values="2;15;3" dur="0.6s" begin="3.3s" fill="freeze"/>
      <animate attributeName="opacity" values="1;0.2" dur="0.6s" begin="3.7s" fill="freeze"/>
    </path>

    <circle cx="450" cy="350" r="0" fill="url(#iBurst)" filter="url(#iGlow)">
      <animate attributeName="r" values="0;400;500" dur="0.6s" begin="3.4s" fill="freeze" calcMode="spline" keySplines="0.1 0 0.1 1"/>
      <animate attributeName="opacity" values="0;1;0" dur="1s" begin="3.4s" fill="freeze"/>
    </circle>
    <circle cx="450" cy="350" r="0" fill="#fff" filter="url(#iGlow)">
      <animate attributeName="r" values="0;60;100" dur="0.3s" begin="3.4s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0.9;0" dur="0.5s" begin="3.4s" fill="freeze"/>
    </circle>

    <!-- SPARKS -->
    <g filter="url(#iGlow)">
      ${sparks.join('\n      ')}
    </g>

    <!-- SCREEN FLASH -->
    <rect width="900" height="700" fill="#fff" opacity="0">
      <animate attributeName="opacity" values="0;0.95;0" dur="0.5s" begin="3.4s" fill="freeze"/>
    </rect>

    <!-- DARKNESS FADES -->
    <rect width="900" height="700" fill="#050810" opacity="1">
      <animate attributeName="opacity" values="1;0" dur="0.8s" begin="4.5s" fill="freeze"/>
    </rect>

    <!-- REVEAL: PROFILE -->
    <rect width="900" height="700" fill="#0b0f1e" opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="4.5s" fill="freeze"/>
    </rect>

    <circle cx="450" cy="350" r="300" fill="url(#iBurst)" opacity="0">
      <animate attributeName="opacity" values="0;0.08;0.04" dur="5s" begin="5.5s" repeatCount="indefinite"/>
      <animate attributeName="r" values="280;320;280" dur="5s" begin="5.5s" repeatCount="indefinite"/>
    </circle>

    <text x="450" y="320" font-family="Segoe UI,Inter,sans-serif" font-size="52" font-weight="800" fill="url(#iName)" text-anchor="middle" opacity="0">
      Yagyesh Vyas
      <animate attributeName="opacity" values="0;0;1" dur="0.8s" begin="5.5s" fill="freeze" keyTimes="0;0.3;1"/>
    </text>

    <text x="450" y="360" font-family="JetBrains Mono,monospace" font-size="16" fill="#22d3ee" text-anchor="middle" letter-spacing="4" opacity="0">
      AI / ML ENGINEER
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="6s" fill="freeze"/>
    </text>

    <text x="450" y="390" font-family="Segoe UI,Inter,sans-serif" font-size="14" fill="#64748b" text-anchor="middle" opacity="0">
      LLM and Generative AI Systems
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="6.3s" fill="freeze"/>
    </text>

    <rect x="150" y="420" width="0" height="2" rx="1" fill="url(#iName)" opacity="0">
      <animate attributeName="width" values="0;600" dur="1s" begin="6.5s" fill="freeze" calcMode="spline" keySplines="0.2 0 0.3 1"/>
      <animate attributeName="opacity" values="0;0.6" dur="0.3s" begin="6.5s" fill="freeze"/>
    </rect>

    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="7s" fill="freeze"/>
      <text x="250" y="470" font-family="JetBrains Mono,monospace" font-size="13" fill="#a78bfa" text-anchor="middle" font-weight="700">118 stars</text>
      <text x="250" y="490" font-family="Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">across all repos</text>
      <text x="450" y="470" font-family="JetBrains Mono,monospace" font-size="13" fill="#22d3ee" text-anchor="middle" font-weight="700">764 rules</text>
      <text x="450" y="490" font-family="Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">VibeGuard security</text>
      <text x="650" y="470" font-family="JetBrains Mono,monospace" font-size="13" fill="#f472b6" text-anchor="middle" font-weight="700">10 repos</text>
      <text x="650" y="490" font-family="Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">open source</text>
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.5s" begin="7.5s" fill="freeze"/>
      <rect x="220" y="520" width="70" height="22" rx="11" fill="#0b0f1e" stroke="#22d3ee" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="255" y="535" font-family="JetBrains Mono,monospace" font-size="10" fill="#22d3ee" text-anchor="middle">LangChain</text>
      <rect x="300" y="520" width="56" height="22" rx="11" fill="#0b0f1e" stroke="#a78bfa" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="328" y="535" font-family="JetBrains Mono,monospace" font-size="10" fill="#a78bfa" text-anchor="middle">LoRA</text>
      <rect x="366" y="520" width="48" height="22" rx="11" fill="#0b0f1e" stroke="#f472b6" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="390" y="535" font-family="JetBrains Mono,monospace" font-size="10" fill="#f472b6" text-anchor="middle">RAG</text>
      <rect x="424" y="520" width="70" height="22" rx="11" fill="#0b0f1e" stroke="#fbbf24" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="459" y="535" font-family="JetBrains Mono,monospace" font-size="10" fill="#fbbf24" text-anchor="middle">Python</text>
      <rect x="504" y="520" width="80" height="22" rx="11" fill="#0b0f1e" stroke="#34d399" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="544" y="535" font-family="JetBrains Mono,monospace" font-size="10" fill="#34d399" text-anchor="middle">PyTorch</text>
      <rect x="594" y="520" width="80" height="22" rx="11" fill="#0b0f1e" stroke="#22d3ee" stroke-width="0.8" stroke-opacity="0.4"/>
      <text x="634" y="535" font-family="JetBrains Mono,monospace" font-size="10" fill="#22d3ee" text-anchor="middle">Ollama</text>
    </g>

    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="8s" fill="freeze"/>
      <text x="450" y="620" font-family="JetBrains Mono,monospace" font-size="13" fill="#64748b" text-anchor="middle" letter-spacing="2">scroll to enter</text>
      <path d="M442,640 L450,650 L458,640 M442,650 L450,660 L458,650" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" begin="8.5s" repeatCount="indefinite"/>
      </path>
    </g>

    <path d="M50,550 Q300,350 850,150" fill="none" stroke="url(#iSlash)" stroke-width="1" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" opacity="0">
      <animate attributeName="stroke-dashoffset" values="100;0" dur="0.5s" begin="5s" fill="freeze"/>
      <animate attributeName="opacity" values="0;0.1" dur="0.3s" begin="5s" fill="freeze"/>
    </path>

    <rect x="0" y="698" width="900" height="2" fill="url(#iFoot)" opacity="0">
      <animate attributeName="opacity" values="0;0.3" dur="0.5s" begin="7s" fill="freeze"/>
      <animate attributeName="width" values="0;900" dur="1s" begin="7s" fill="freeze"/>
    </rect>
  </g>
</svg>`;

fs.writeFileSync('assets/intro.svg', svg);
console.log('intro.svg generated');
