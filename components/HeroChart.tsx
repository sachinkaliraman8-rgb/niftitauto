const svg = `
<svg viewBox="0 0 900 380" width="100%" role="img" aria-label="Chart with an automatically drawn rising support line and a breakout marker">
  <g stroke-linecap="round">
    <g class="cndl" style="animation-delay:.05s">
      <line x1="90" y1="238" x2="90" y2="300" stroke="#3C4150" stroke-width="3"/>
      <rect x="76" y="250" width="28" height="34" rx="2" fill="#3C4150"/>
    </g>
    <g class="cndl" style="animation-delay:.12s">
      <line x1="170" y1="240" x2="170" y2="318" stroke="#00A870" stroke-width="3"/>
      <rect x="156" y="252" width="28" height="42" rx="2" fill="#00A870"/>
    </g>
    <g class="cndl" style="animation-delay:.19s">
      <line x1="250" y1="196" x2="250" y2="268" stroke="#00A870" stroke-width="3"/>
      <rect x="236" y="208" width="28" height="48" rx="2" fill="#00A870"/>
    </g>
    <g class="cndl" style="animation-delay:.26s">
      <line x1="330" y1="192" x2="330" y2="272" stroke="#3C4150" stroke-width="3"/>
      <rect x="316" y="204" width="28" height="40" rx="2" fill="#3C4150"/>
    </g>
    <g class="cndl" style="animation-delay:.33s">
      <line x1="410" y1="164" x2="410" y2="236" stroke="#00A870" stroke-width="3"/>
      <rect x="396" y="176" width="28" height="44" rx="2" fill="#00A870"/>
    </g>
    <g class="cndl" style="animation-delay:.40s">
      <line x1="490" y1="158" x2="490" y2="226" stroke="#3C4150" stroke-width="3"/>
      <rect x="476" y="170" width="28" height="36" rx="2" fill="#3C4150"/>
    </g>
    <g class="cndl" style="animation-delay:.47s">
      <line x1="570" y1="132" x2="570" y2="200" stroke="#00A870" stroke-width="3"/>
      <rect x="556" y="144" width="28" height="42" rx="2" fill="#00A870"/>
    </g>
    <g class="cndl" style="animation-delay:.54s">
      <line x1="650" y1="120" x2="650" y2="176" stroke="#00A870" stroke-width="3"/>
      <rect x="636" y="132" width="28" height="30" rx="2" fill="#00A870"/>
    </g>
    <g class="cndl" style="animation-delay:.61s">
      <line x1="730" y1="66" x2="730" y2="150" stroke="#00A870" stroke-width="3"/>
      <rect x="716" y="78" width="28" height="58" rx="2" fill="#00A870"/>
    </g>
  </g>

  <line class="sweep" x1="250" y1="196" x2="860" y2="128" stroke="#F2604C" stroke-width="2.5" stroke-dasharray="7 6" opacity=".9"/>
  <line class="sweep" style="animation-delay:1.35s" x1="170" y1="318" x2="860" y2="150" stroke="#00A870" stroke-width="3"/>

  <g class="late">
    <circle cx="170" cy="318" r="5" fill="#08090C" stroke="#00A870" stroke-width="2.5"/>
    <circle cx="330" cy="272" r="5" fill="#08090C" stroke="#00A870" stroke-width="2.5"/>
    <circle cx="490" cy="226" r="5" fill="#08090C" stroke="#00A870" stroke-width="2.5"/>
    <path d="M730 178 L721 192 L739 192 Z" fill="#E9A23B"/>
  </g>
</svg>
`;

export default function HeroChart() {
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
