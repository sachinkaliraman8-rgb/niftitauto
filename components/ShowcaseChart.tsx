const svg = `
<svg viewBox="0 0 460 330" width="100%" role="img" aria-label="Chart demonstrating levels, a confirmed breakout, and a retest">
  <g stroke-linecap="round">
    <line x1="46" y1="214" x2="46" y2="276" stroke="#3C4150" stroke-width="3"/><rect x="35" y="226" width="22" height="34" rx="2" fill="#3C4150"/>
    <line x1="94" y1="220" x2="94" y2="288" stroke="#00A870" stroke-width="3"/><rect x="83" y="232" width="22" height="38" rx="2" fill="#00A870"/>
    <line x1="142" y1="182" x2="142" y2="248" stroke="#00A870" stroke-width="3"/><rect x="131" y="192" width="22" height="42" rx="2" fill="#00A870"/>
    <line x1="190" y1="176" x2="190" y2="252" stroke="#3C4150" stroke-width="3"/><rect x="179" y="188" width="22" height="38" rx="2" fill="#3C4150"/>
    <line x1="238" y1="150" x2="238" y2="216" stroke="#00A870" stroke-width="3"/><rect x="227" y="160" width="22" height="40" rx="2" fill="#00A870"/>
    <line x1="286" y1="140" x2="286" y2="206" stroke="#3C4150" stroke-width="3"/><rect x="275" y="152" width="22" height="34" rx="2" fill="#3C4150"/>
    <line x1="334" y1="72" x2="334" y2="152" stroke="#00A870" stroke-width="3"/><rect x="323" y="84" width="22" height="54" rx="2" fill="#00A870"/>
    <line x1="382" y1="86" x2="382" y2="146" stroke="#3C4150" stroke-width="3"/><rect x="371" y="98" width="22" height="34" rx="2" fill="#3C4150"/>
    <line x1="424" y1="58" x2="424" y2="128" stroke="#00A870" stroke-width="3"/><rect x="413" y="70" width="22" height="46" rx="2" fill="#00A870"/>
  </g>

  <g class="layer on" id="L1">
    <line x1="94" y1="288" x2="450" y2="196" stroke="#00A870" stroke-width="2.8"/>
    <line x1="142" y1="118" x2="450" y2="106" stroke="#F2604C" stroke-width="2.4" stroke-dasharray="7 6"/>
    <circle cx="94"  cy="288" r="4.5" fill="#121419" stroke="#00A870" stroke-width="2.2"/>
    <circle cx="190" cy="252" r="4.5" fill="#121419" stroke="#00A870" stroke-width="2.2"/>
    <circle cx="286" cy="206" r="4.5" fill="#121419" stroke="#00A870" stroke-width="2.2"/>
  </g>

  <g class="layer" id="L2">
    <path d="M334 176 L324 192 L344 192 Z" fill="#E9A23B"/>
    <rect x="323" y="300" width="22" height="22" rx="2" fill="#E9A23B"/>
    <rect x="275" y="312" width="22" height="10" rx="2" fill="#2C303B"/>
    <rect x="227" y="309" width="22" height="13" rx="2" fill="#2C303B"/>
  </g>

  <g class="layer" id="L3">
    <circle cx="382" cy="146" r="11" fill="none" stroke="#00A870" stroke-width="2.6"/>
    <circle cx="382" cy="146" r="3.5" fill="#00A870"/>
  </g>
</svg>
`;

export default function ShowcaseChart() {
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
