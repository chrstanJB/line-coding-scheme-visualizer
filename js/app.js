/* Pure encoder functions return one object per bit; SVG drawing is kept separate. */
(() => {
  'use strict';
  const schemes = [
    {id:'unipolar',name:'Unipolar NRZ',color:'#d06b46',hint:'1 = +V · 0 = 0 V',encode:encodeUnipolarNRZ},
    {id:'nrzl',name:'Polar NRZ-L',color:'#347f73',hint:'1 = −V · 0 = +V (assignment convention)',encode:encodeNRZIL},
    {id:'nrzi',name:'Polar NRZ-I',color:'#5271a6',hint:'1 inverts at the bit boundary',encode:(b,l)=>encodeNRZI(b,l)},
    {id:'rz',name:'Polar RZ',color:'#b17b30',hint:'First half of each bit, then return to 0 V',encode:encodeRZ},
    {id:'manchester',name:'Polar Biphase Manchester',color:'#ad5c7b',hint:'Always transitions mid-bit',encode:encodeManchester},
    {id:'diffman',name:'Polar Biphase Differential Manchester',color:'#667d42',hint:'Mid-bit transition · 0 inverts at boundary',encode:(b,l)=>encodeDiffManchester(b,l)},
    {id:'ami',name:'Bipolar AMI',color:'#397da0',hint:'1 pulses alternate polarity',encode:encodeAMI},
    {id:'pseudo',name:'Bipolar Pseudoternary',color:'#8b68a1',hint:'0 pulses alternate polarity',encode:encodePseudoternary}
  ];
  const $ = id => document.getElementById(id);
  const form=$('bitForm'), lengthInput=$('bitLength'), bitsInput=$('bitsInput'), lengthError=$('lengthError'), bitsError=$('bitsError'), waveforms=$('waveforms'), playBtn=$('playBtn');
  let bits='', initialLevel='hi', animationFrame=0, animationStart=0, resizeTimer, starterUntouched=true;

  function levelOf(token){ if(['hi','pos','posRZ','nTp'].includes(token)) return 1; if(['lo','neg','negRZ','pTn'].includes(token)) return -1; return 0; }
  function entry(bit,start,mid,end,token,inversion){return {bit,levelStart:start,levelMid:mid,levelEnd:end,token,inversion};}
  function encodeUnipolarNRZ(b){return [...b].map(x=>{const l=x==='1'?1:0;return entry(x,l,l,l,x==='1'?'hi':'lo');});}
  // Assignment mapping: 1 is negative and 0 is positive.
  function encodeNRZIL(b){return [...b].map(x=>{const l=x==='1'?-1:1;return entry(x,l,l,l,x==='1'?'neg':'pos');});}
  // NRZ-I: invert at the bit boundary for each 1; the level then holds.
  function encodeNRZI(b,initial='hi'){let level=initial==='hi'?1:-1;return [...b].map(x=>{const inv=x==='1';if(inv)level=-level;const token=(level>0?'pos':'neg')+(inv?' inv':' no inv');return entry(x,level,level,level,token,inv);});}
  function encodeRZ(b){return [...b].map(x=>{const l=x==='1'?1:-1;return entry(x,l,0,0,x==='1'?'posRZ':'negRZ');});}
  function encodeManchester(b){return [...b].map(x=>{const s=x==='1'?-1:1,e=-s;return entry(x,s,e,e,x==='1'?'nTp':'pTn');});}
  // Differential Manchester: boundary inversion for 0, then always transition mid-bit.
  function encodeDiffManchester(b,initial='hi'){let level=initial==='hi'?1:-1;return [...b].map(x=>{const inv=x==='0';if(inv)level=-level;const start=level,mid=-start,end=mid,pattern=start>0?'pTn':'nTp';level=end;return entry(x,start,mid,end,pattern+(inv?' inv':' no inv'),inv);});}
  function encodeAMI(b){let last=-1;return [...b].map(x=>{const l=x==='1'?-last:0;if(x==='1')last=l;return entry(x,l,l,l,x==='1'?(l>0?'pos':'neg'):'zero');});}
  function encodePseudoternary(b){let last=-1;return [...b].map(x=>{const l=x==='0'?-last:0;if(x==='0')last=l;return entry(x,l,l,l,x==='0'?(l>0?'pos':'neg'):'zero');});}

  function checkInput(){
    const raw=lengthInput.value.trim(),n=Number(raw);lengthError.textContent='';bitsError.textContent='';lengthInput.removeAttribute('aria-invalid');bitsInput.removeAttribute('aria-invalid');
    if(!/^\d+$/.test(raw)||!Number.isInteger(n)||n<0||n>32){lengthInput.setAttribute('aria-invalid','true');lengthError.textContent='Enter a whole number from 0 to 32.';return false;}
    let clean=bitsInput.value.replace(/\s/g,'');
    if(starterUntouched){bits='';return true;}
    bitsInput.value=clean;
    if(!/^[01]*$/.test(clean)){bitsInput.setAttribute('aria-invalid','true');bitsError.textContent='Use only 0 and 1 (spaces are ignored).';return false;}
    if(clean===''&&n===0){bits='';return true;}
    if(clean.length!==n){bitsInput.setAttribute('aria-invalid','true');bitsError.textContent=`Expected ${n} bits, got ${clean.length}.`;return false;}
    bits=clean;return true;
  }
  function selectedSchemes(){const selected=[...document.querySelectorAll('.scheme-list input:checked')].map(x=>x.value);return schemes.filter(s=>selected.includes(s.id));}
  function y(level,top,height){return top+height/2-level*(height*.31);}
  function svgFor(s,items){
    const W=760,left=42,right=10,plotW=W-left-right,top=13,plotH=68,axisY=y(0,top,plotH),cell=plotW/items.length;
    const lines=[];
    for(let i=0;i<=items.length;i++){const x=left+i*cell;lines.push(`<line x1="${x}" y1="${top-1}" x2="${x}" y2="${top+plotH+6}" stroke="${i===0||i===items.length?'var(--grid)':'var(--grid-soft)'}" stroke-width="1"/>`);}
    const zero=`<line x1="${left}" y1="${axisY}" x2="${W-right}" y2="${axisY}" stroke="var(--axis)" stroke-width="1" stroke-dasharray="3 4"/>`;
    const labels=`<text x="0" y="${y(1,top,plotH)+3}" font-size="11" fill="var(--muted)">+V</text><text x="8" y="${axisY+3}" font-size="11" fill="var(--muted)">0</text><text x="0" y="${y(-1,top,plotH)+3}" font-size="11" fill="var(--muted)">−V</text>`;
    let d='', previous=null;
    items.forEach((a,i)=>{const x=left+i*cell,xm=x+cell/2,x2=x+cell,start=y(a.levelStart,top,plotH),end=y(a.levelEnd,top,plotH);if(previous!==null)d+=` L ${x} ${previous} L ${x} ${start}`;else d=`M ${x} ${start}`;if(a.levelMid!==undefined&&a.levelMid!==a.levelStart){const mid=y(a.levelMid,top,plotH);d+=` L ${xm} ${start} L ${xm} ${mid}`;if(a.levelEnd!==a.levelMid)d+=` L ${x2} ${mid} L ${x2} ${end}`;else d+=` L ${x2} ${mid}`;}else d+=` L ${x2} ${end}`;previous=end;});
    const wave=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const bitLabels=items.map((a,i)=>`<text x="${left+(i+.5)*cell}" y="${top+plotH+18}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--tag-text)">${a.bit}</text>`).join('');
    return `<svg class="wave-svg" data-scheme="${s.id}" data-left="${left}" data-right="${right}" viewBox="0 0 ${W} 112" role="img" aria-label="${s.name} waveform for ${bits}"><g>${lines.join('')}${zero}${labels}${wave}${bitLabels}</g><line class="cursor-line" x1="${left}" x2="${left}" y1="${top-5}" y2="${top+plotH+7}" stroke="${s.color}" stroke-width="1.6" opacity="0"/><circle class="cursor-dot" cx="${left}" cy="${axisY}" r="3.3" fill="${s.color}" opacity="0"/></svg>`;
  }
  function render(){
    const selected=selectedSchemes();$('bitSummary').textContent=`${bits.length} ${bits.length===1?'bit':'bits'}`;playBtn.disabled=!selected.length||!bits.length;waveforms.innerHTML='';
    if(!bits.length){waveforms.innerHTML='<div class="wave-card empty">Your bit stream is empty. Enter bits to generate a signal.</div>';return;}
    if(!selected.length){waveforms.innerHTML='<div class="wave-card empty">Choose one or more schemes to see their waveforms.</div>';return;}
    selected.forEach(s=>{const items=s.encode(bits,initialLevel);const card=document.createElement('article');card.className='wave-card';card.style.setProperty('--accent',s.color);card.innerHTML=`<div class="wave-title-row"><div class="wave-title"><span class="scheme-dot" style="--accent:${s.color}"></span>${s.name}</div><span class="scheme-subtitle">${s.hint}</span></div><div class="wave-scroll">${svgFor(s,items)}</div><div class="tokens"><span class="tokens-label">Output</span><div class="token-list">${items.map((a,i)=>`<span class="token" data-index="${i}" title="Bit ${i+1}: ${a.bit}">${a.token}</span>`).join('')}</div></div>`;waveforms.appendChild(card);});
  }
  function stopAnimation(){if(animationFrame)cancelAnimationFrame(animationFrame);animationFrame=0;document.querySelectorAll('.cursor-line,.cursor-dot').forEach(x=>x.setAttribute('opacity','0'));document.querySelectorAll('.token.current').forEach(x=>x.classList.remove('current'));playBtn.innerHTML='<span aria-hidden="true">▶</span> Play animation';playBtn.setAttribute('aria-pressed','false');}
  function animate(now){if(!animationStart)animationStart=now;const duration=Math.max(1600,bits.length*260),progress=Math.min((now-animationStart)/duration,1),index=Math.min(Math.floor(progress*bits.length),bits.length-1);document.querySelectorAll('.wave-svg').forEach(svg=>{const w=760-Number(svg.dataset.left)-Number(svg.dataset.right),x=Number(svg.dataset.left)+progress*w;for(const c of svg.querySelectorAll('.cursor-line,.cursor-dot')){if(c.tagName==='line')c.setAttribute('x1',x),c.setAttribute('x2',x);else c.setAttribute('cx',x);c.setAttribute('opacity','.9');}});document.querySelectorAll('.token').forEach(t=>t.classList.toggle('current',Number(t.dataset.index)===index));if(progress<1)animationFrame=requestAnimationFrame(animate);else{animationFrame=0;playBtn.innerHTML='<span aria-hidden="true">▶</span> Play animation';playBtn.setAttribute('aria-pressed','false');}}
  function startAnimation(){stopAnimation();if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('.wave-svg').forEach(svg=>{const end=760-Number(svg.dataset.right);svg.querySelectorAll('.cursor-line,.cursor-dot').forEach(x=>{if(x.tagName==='line')x.setAttribute('x1',end),x.setAttribute('x2',end);else x.setAttribute('cx',end);x.setAttribute('opacity','.9');});});document.querySelectorAll('.token').forEach(x=>x.classList.add('current'));playBtn.innerHTML='<span aria-hidden="true">✓</span> Animation skipped';playBtn.setAttribute('aria-pressed','false');return;}animationStart=0;playBtn.innerHTML='<span aria-hidden="true">■</span> Playing…';playBtn.setAttribute('aria-pressed','true');animationFrame=requestAnimationFrame(animate);}
  function runSelfTest(){const input='111001011000',expected=[
    ['hi hi hi lo lo hi lo hi hi lo lo lo',encodeUnipolarNRZ(input)],['neg neg neg pos pos neg pos neg neg pos pos pos',encodeNRZIL(input)],
    ['neg inv|pos inv|neg inv|neg no inv|neg no inv|pos inv|pos no inv|neg inv|pos inv|pos no inv|pos no inv|pos no inv',encodeNRZI(input,'hi')],
    ['posRZ posRZ posRZ negRZ negRZ posRZ negRZ posRZ posRZ negRZ negRZ negRZ',encodeRZ(input)],
    ['nTp nTp nTp pTn pTn nTp pTn nTp nTp pTn pTn pTn',encodeManchester(input)],
    ['pTn no inv|nTp no inv|pTn inv|pTn inv|pTn no inv|nTp inv|nTp no inv|pTn no inv|nTp inv|nTp inv|nTp inv|nTp inv',encodeDiffManchester(input,'hi')],
    ['pos neg pos zero zero neg zero pos neg zero zero zero',encodeAMI(input)],['zero zero zero pos neg zero pos zero zero neg pos neg',encodePseudoternary(input)]];
    const failed=expected.map(([want,items],i)=>{const got=items.map(x=>x.token).join(i===2||i===5?'|':' ');if(got!==want){console.error(`Line coding self-test failed for scheme ${i+1}`,{want,got});return true;}return false;}).some(Boolean);const el=$('selfTest');el.textContent=failed?'✕ self-test failed':'✓ self-test passed';el.classList.toggle('fail',failed);return !failed;
  }
  form.addEventListener('submit',e=>{e.preventDefault();stopAnimation();if(starterUntouched&&bitsInput.value.trim()==='0'){starterUntouched=false;lengthInput.value='1';$('expectedCount').textContent='1';}if(checkInput())render();});
  lengthInput.addEventListener('input',()=>{const n=Number(lengthInput.value);$('expectedCount').textContent=Number.isFinite(n)&&n>=0?n:'—';lengthInput.removeAttribute('aria-invalid');lengthError.textContent='';});
  bitsInput.addEventListener('input',()=>{starterUntouched=false;bitsInput.removeAttribute('aria-invalid');bitsError.textContent='';const clean=bitsInput.value.replace(/\s/g,'');if(/^[01]*$/.test(clean)&&clean.length<=32){lengthInput.value=String(clean.length);$('expectedCount').textContent=String(clean.length);bits=clean;stopAnimation();render();}else{bitsInput.setAttribute('aria-invalid','true');bitsError.textContent=clean.length>32?'A maximum of 32 bits is allowed.':'Use only 0 and 1 (spaces are ignored).';}});
  document.querySelectorAll('.scheme-list input').forEach(x=>x.addEventListener('change',()=>{stopAnimation();if(checkInput())render();}));
  $('selectAll').addEventListener('click',()=>{document.querySelectorAll('.scheme-list input').forEach(x=>x.checked=true);stopAnimation();render();});
  $('clearAll').addEventListener('click',()=>{document.querySelectorAll('.scheme-list input').forEach(x=>x.checked=false);stopAnimation();render();});
  document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{initialLevel=b.dataset.level;document.querySelectorAll('[data-level]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stopAnimation();render();}));
  playBtn.addEventListener('click',()=>animationFrame?stopAnimation():startAnimation());
  $('resetBtn').addEventListener('click',()=>{lengthInput.value='0';$('expectedCount').textContent='0';bitsInput.value='0';bits='';starterUntouched=true;document.querySelectorAll('.scheme-list input').forEach(x=>x.checked=true);initialLevel='hi';document.querySelectorAll('[data-level]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.level==='hi')));lengthError.textContent='';bitsError.textContent='';lengthInput.removeAttribute('aria-invalid');bitsInput.removeAttribute('aria-invalid');stopAnimation();render();});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,120);});
  const themeToggle=$('themeToggle');
  function applyTheme(theme,save=false){document.documentElement.dataset.theme=theme;const dark=theme==='dark';themeToggle.setAttribute('aria-pressed',String(dark));themeToggle.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);themeToggle.querySelector('.theme-icon').textContent=dark?'☀':'☾';themeToggle.querySelector('.theme-label').textContent=dark?'Light mode':'Dark mode';document.querySelector('meta[name=theme-color]').content=dark?'#101915':'#f4f7f5';if(save){try{localStorage.setItem('line-coding-scheme-visualizer-theme',theme);}catch{}}}
  applyTheme(document.documentElement.dataset.theme||'light');
  themeToggle.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark',true));
  runSelfTest();render();
})();
