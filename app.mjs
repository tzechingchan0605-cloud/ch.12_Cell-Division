import {snapshot,countsAt,referenceStages} from './model.mjs';
import {sceneAt,advancePosition} from './animation.mjs';
import {phaseAt} from './phases.mjs';
import {dict,terms} from './i18n.mjs';
let lang;try{lang=localStorage.getItem('cell-language')}catch{}if(!dict[lang])lang='zh';
const s={kind:'meiosis',event:0,position:0,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,flips:[false,false],cross:false,labels:true,alleles:false,compare:false,mode:'explore',playing:false,speed:2400,selected:null,records:[],q:0,choice:null,attempt:false,hint:0,reveal:false,response:''};
let timer, previousTime=null, animationTarget=8;const t=k=>dict[lang][k],esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(id,key,active=false)=>`<button id="${id}" class="${active?'active':''}">${t(key)}</button>`;
const stage=(kind,e)=>t(kind==='mitosis'?'mitStages':'stages')[e];
const phaseName=(kind,position)=>{const phase=phaseAt(kind,position);return t(phase.key)+(phase.division?' '+phase.division:'');};
const phaseDescription=(kind,position)=>{const phase=phaseAt(kind,position);const key=phase.key==='divisionComplete'?phase.key+(kind==='mitosis'?'Mitosis':'Meiosis'):phase.key+phase.division;return t('phaseCopy')[key];};
const colour=o=>o==='M'?'#b65e45':'#437da1';
const svgViews = new WeakMap();
function drawing(kind) {
  return `<div class="model"><h3>${t(kind)}</h3><div class="scene-window"><svg data-kind="${kind}" viewBox="0 -110 600 550" role="group"></svg><span class="phase-label" data-phase="${kind}"></span></div><div class="count" data-count="${kind}"></div></div>`;
}
function fitAnnotations(svg) {
  const box=svg.getBoundingClientRect(),scale=Math.min(box.width/600,box.height/550);
  if(scale>0){svg.style.setProperty('--annotation-size',Math.max(11,8.5/scale)+'px');svg.style.setProperty('--allele-size',Math.max(10,8/scale)+'px');}
}
function initialiseScene(svg) {
  const scene=sceneAt(svg.dataset.kind,0);
  svg.innerHTML=`<g class="membranes">${scene.membranes.map(a=>`<path data-membrane="${a.key}" class="cell"/>`).join('')}</g>
    <g class="nuclei" aria-hidden="true">${scene.nuclei.map(a=>`<path data-nucleus="${a.key}" class="nuclear-envelope"/>`).join('')}</g><g class="spindles" aria-hidden="true">${scene.strands.map(a=>`<path data-spindle="${a.key}" fill="none" stroke="#b5cec3" stroke-width="1.3"/>`).join('')}</g>
    <g class="chromatids">${[...scene.strands].sort((a,b)=>b.sister-a.sister).map(a=>`<g class="chromosome" data-chrom="${a.id}" data-strand="${a.key}" role="button" tabindex="0"><path class="proximal" fill="none" stroke-width="7" stroke-linecap="round"/><circle class="centromere" r="4" fill="#253f45"/><text class="svgtext origin-label" text-anchor="middle"/><text class="svgtext allele-proximal"/></g>`).join('')}</g>
    <g class="segments" aria-hidden="true">${scene.strands.map(a=>`<g data-segment="${a.key}"><path fill="none" stroke-width="7" stroke-linecap="round"/><text class="svgtext allele-distal"/></g>`).join('')}</g>`;
  const view={};
  for(const [group,attribute] of [['strands','strand'],['segments','segment'],['membranes','membrane'],['spindles','spindle'],['nuclei','nucleus']])
    view[group]=new Map([...svg.querySelectorAll(`[data-${attribute}]`)].map(node=>[node.dataset[attribute],node]));
  svgViews.set(svg,view);
  return view;
}
function setAttributes(node, attributes) {
  for(const [name,value] of Object.entries(attributes)) node.setAttribute(name,value);
}
function paintDrawing(svg) {
  const kind=svg.dataset.kind,view=svgViews.get(svg)||initialiseScene(svg);
  const position=s.reduced?Math.floor(s.position+1e-8):s.position;
  const frame=sceneAt(kind,position,s.flips,s.cross);
  const name=phaseName(kind,position);
  document.querySelector(`[data-phase="${kind}"]`).textContent=name;
  svg.setAttribute('aria-label',t(kind)+' — '+name);
  for(const a of frame.nuclei)setAttributes(view.nuclei.get(a.key),{d:a.path,opacity:a.opacity});
  for(const a of frame.membranes) setAttributes(view.membranes.get(a.key),{d:a.path,opacity:a.opacity});
  for(const a of frame.spindles) setAttributes(view.spindles.get(a.key),{d:`M ${a.x} ${a.y} L ${a.toX} ${a.toY}`,opacity:a.opacity});
  for(const a of frame.strands) {
    const node=view.strands.get(a.key),label=node.querySelector('.origin-label');
    const selected=s.selected===a.id,related=s.selected&&s.selected[1]===a.id[1];
    const labelOpacity=a.sister===0?1:1-frame.attached;
    node.classList.toggle('selected',selected);node.classList.toggle('related',!selected&&related);
    setAttributes(node,{opacity:a.opacity,tabindex:a.opacity<.01?-1:0,'aria-hidden':a.opacity<.01,'aria-label':`${t('identity')} ${a.id}; ${t('homologue')} ${a.origin==='M'?'P':'M'}${a.pair}`});
    setAttributes(node.querySelector('.proximal'),{d:`M ${a.x+a.topX} ${a.y+a.topY} L ${a.x} ${a.y} L ${a.x+a.bottomX*.4} ${a.y+a.bottomY*.4}`,stroke:colour(a.origin),'stroke-dasharray':a.origin==='P'?'6 3':''});
    setAttributes(node.querySelector('.centromere'),{cx:a.x,cy:a.y,opacity:labelOpacity});
    setAttributes(label,{x:a.x,y:a.y+a.length/2+17,opacity:s.labels?labelOpacity:0});
    label.textContent=a.id;
    const allele=node.querySelector('.allele-proximal');
    setAttributes(allele,{x:a.x+a.topX+6,y:a.y+a.topY*.7,opacity:s.alleles?1:0});allele.textContent=a.origin+'a';
  }
  for(const a of frame.distal) {
    const node=view.segments.get(a.key);
    setAttributes(node,{opacity:a.opacity});
    setAttributes(node.querySelector('path'),{d:`M ${a.x+a.bottomX*.4} ${a.y+a.bottomY*.4} L ${a.x+a.bottomX} ${a.y+a.bottomY}`,stroke:colour(a.origin),'stroke-dasharray':a.origin==='P'?'6 3':''});
    const allele=node.querySelector('text');setAttributes(allele,{x:a.x+a.bottomX+6,y:a.y+a.bottomY*.9,opacity:s.alleles?1:0});allele.textContent=a.origin+'b';
  }
}
function paint() {
  s.event=Math.min(8,Math.floor(s.position+1e-8));
  document.querySelectorAll('svg[data-kind]').forEach(paintDrawing);
  const moving=s.position-s.event>1e-7;
  for(const kind of ['mitosis','meiosis']) {
    const count=document.querySelector(`[data-count="${kind}"]`);if(!count)continue;
    const info=countsAt(kind,s.position);
    count.innerHTML=`<span>${t('chromosomes')}: <strong>${info.notation}</strong></span><span>${t('joinedSisters')}: <strong>t = ${info.chromatids}</strong></span><span class="count-scope">${t('cell')} · ${t('dna')}: ${info.count[1]}</span>${info.perPole?`<span class="pole-count">${t('pole')}: ${info.perPole.notation}, t = ${info.perPole.chromatids} · ${t('dna')}: ${info.perPole.count[1]}</span>`:''}`;
  }
  const small=document.querySelector('.stage small'),title=document.querySelector('.stage b');
  small.textContent=`${String(s.event+1).padStart(2,'0')} / 09`;
  title.textContent=t(s.kind)+' · '+phaseDescription(s.kind,s.reduced?Math.floor(s.position):s.position);
  document.getElementById('model-note').textContent=moving?t('transitionNote'):note();
  document.getElementById('timeline').value=s.position;
  document.getElementById('timeline').setAttribute('aria-valuetext',title.textContent);
  for(const id of ['flip0','flip1','cross'])document.getElementById(id).disabled=s.position>=4;
  const play=document.getElementById('play');play.textContent=t(s.playing?'pause':'play');play.classList.toggle('active',s.playing);
  document.getElementById('step').disabled=s.position>=8;
}
function note(){if(s.event===1)return t('repnote');if(s.event===4&&s.kind==='meiosis')return t('homologuesnote');if((s.event===4&&s.kind==='mitosis')||s.event===7&&s.kind==='meiosis')return t('sistersnote');if(s.event>=5&&s.kind==='meiosis')return t('norep')+' '+t('variation');return t('select');}
function render(){const retained=new Map([...document.querySelectorAll('svg[data-kind]')].map(svg=>[svg.dataset.kind,svg]));const focused=document.activeElement?.id;document.documentElement.lang=lang==='zh'?'zh-Hant':'en-GB';document.title=t('brand');document.getElementById('brand').textContent=t('brand');['zh','en'].forEach(l=>{document.getElementById(l).classList.toggle('active',l===lang);document.getElementById(l).setAttribute('aria-pressed',l===lang)});
 const q=t('questions')[s.q];
 document.getElementById('app').innerHTML=`<div class="intro"><div><div class="eyebrow">${t('eyebrow')}</div><h1>${t('title')}</h1><p>${t('intro')}</p></div><span class="pill">${t('badge')}</span></div><nav class="toolbar" aria-label="${t('model')}">${btn('explore','explore',s.mode==='explore')}${btn('challenge','challenge',s.mode==='challenge')}<span style="flex:1"></span>${btn('mitosis','mitosis',s.kind==='mitosis')}${btn('meiosis','meiosis',s.kind==='meiosis')}${btn('compare','compare',s.compare)}</nav>
 <div class="layout"><section class="card"><div class="cardhead"><h2>${t('model')}</h2><button id="labels" aria-pressed="${s.labels}">${t('labels')}: ${t(s.labels?'on':'off')}</button></div><div class="stage"><small>${String(s.event+1).padStart(2,'0')} / 09</small> <b>${stage(s.kind,s.event)}</b></div>${s.compare?`<div class="muted" style="padding:0 20px">${t('sync')}</div>`:''}<div class="modelgrid ${s.compare?'compare':''}">${s.compare?drawing('mitosis')+drawing('meiosis'):drawing(s.kind)}</div><div class="legend"><span><i class="dot"></i>${t('maternal')}</span><span><i class="dot p"></i>${t('paternal')}</span><span>● ${terms[5][lang==='zh'?0:1]}</span></div><div class="transport"><div class="row">${btn('play',s.playing?'pause':'play',s.playing)}${btn('step','step')}${btn('replay','replay')}${btn('reset','reset')}<label for="speed" class="muted">${t('speed')}</label><select id="speed"><option value="4200" ${s.speed===4200?'selected':''}>${t('slow')}</option><option value="2400" ${s.speed===2400?'selected':''}>${t('normal')}</option><option value="1200" ${s.speed===1200?'selected':''}>${t('fast')}</option></select></div><input id="timeline" type="range" min="0" max="8" step="0.001" value="${s.position}" aria-label="${t('timeline')}"/><div class="events"><span>${t('stages')[0]}</span><span>${t('stages')[4]}</span><span>${t('stages')[8]}</span></div></div><details class="observation-note"><summary>${t('observationHint')}</summary><div class="notice" id="model-note">${note()}</div></details></section>
 <aside class="sidebar"><section class="card panel"><h2>${t('settings')}</h2>${[0,1].map(i=>`<div class="control"><label>${t('pair')} ${i+1} <b>${s.flips[i]?'P | M':'M | P'}</b></label><button id="flip${i}" ${s.event>=4?'disabled':''}>↔ ${t('flip')}</button></div>`).join('')}<div class="control"><label><input id="cross" type="checkbox" ${s.cross?'checked':''} ${s.event>=4?'disabled':''}>${t('cross')}</label></div><div class="control"><label><input id="reduced" type="checkbox" ${s.reduced?'checked':''}>${t('reducedMotion')}</label></div><div class="control"><label><input id="alleles" type="checkbox" ${s.alleles?'checked':''}>${t('alleles')}</label></div>${btn('random','random')}<p>${t('locked')}</p><details><summary>${t('cross')}</summary><p>${t('crosshelp')}</p></details></section><section class="card panel"><h2>${t('selected')}</h2><p>${s.selected?`${t('identity')}: <b>${s.selected}</b><br>${t('homologue')}: <b>${s.selected[0]==='M'?'P':'M'}${s.selected[1]}</b><br>${t('sisterHelp')}`:t('select')}</p></section></aside></div>
 <div class="below"><section class="card panel"><h2>${t('observations')}</h2><div class="row">${btn('record','record')}${btn('download','download')}${btn('clear','clear')}</div>${s.records.length?`<div class="scroll"><table data-records><thead><tr><th>${t('trial')}</th><th>${t('stage')}</th><th>${t('chromosomeChromatidCounts')}</th><th>${t('result')}</th></tr></thead><tbody>${s.records.map((r,i)=>`<tr><td>${i+1}<br>${t(r.kind)}<br>${t('crossCSV')}: ${t(r.cross?'on':'off')}<br>${r.flips.map(x=>x?'P|M':'M|P').join(' / ')}</td><td>${phaseName(r.kind,r.position)}<br>${t('time')}: ${r.position.toFixed(3)}</td><td>${r.counting.notation} / t = ${r.counting.chromatids}<br>${t('cell')} · ${t('dna')}: ${r.counting.count[1]}${r.counting.perPole?`<br>${t('pole')}: ${r.counting.perPole.notation}, t = ${r.counting.perPole.chromatids} · ${t('dna')}: ${r.counting.perPole.count[1]}`:''}</td><td>${r.event===8?r.snap.cells.map(c=>c.map(a=>`${a.id} [${a.loci.join('·')}]`).join(' + ')).join('<br>'):'—'}</td></tr>`).join('')}</tbody></table></div>`:`<p class="muted">${t('empty')}</p>`}</section>
 <section class="card panel" ${s.mode!=='challenge'?'hidden':''}><div class="eyebrow">${s.q+1} / 5</div><h2>${t('guide')}</h2><h3>${q[0]}</h3><p>${t('predict')}</p><div class="qoptions">${q[1].map((a,i)=>`<button data-choice="${i}" class="${s.choice===i?'active':''}">${a}</button>`).join('')}</div><div class="row">${btn('check','check')}${btn('hint','hint')}${btn('reveal','reveal')}</div>${s.hint?`<p class="notice">${q[3]}${s.hint>1?' '+t('predict'):''}</p>`:''}${s.attempt||s.reveal?`<div class="feedback">${s.attempt?t('attempt')+'<br>':''}${q[2]}</div>`:''}<label for="response"><p>${t('explain')}</p></label><textarea id="response">${esc(s.response)}</textarea>${btn('qnext','qnext')}</section></div>
 <section class="card panel" style="margin-top:20px"><details><summary>${t('countReference')}</summary><p>${t('referenceExplanation')}</p><div class="scroll"><table data-count-reference><thead><tr><th>${t('stage')}</th><th>${t('chromosomes')}</th><th>${t('joinedSisters')} (t)</th><th>${t('dna')}</th></tr></thead><tbody>${referenceStages.map(([kind,position])=>{const info=countsAt(kind,position);return `<tr><td>${t(kind)} · ${position===5&&kind==='meiosis'?t('endMeiosisI'):phaseName(kind,position)}</td><td>${info.count[0]}</td><td>${info.chromatids}</td><td>${info.count[1]}</td></tr>`}).join('')}</tbody></table></div></details><details style="margin-top:12px"><summary>${t('assumptions')}</summary><p>${t('countNotation')}</p><p>${t('assumptionText')}</p><p>${t('source')}</p><p>${t('crosshelp')}</p><p>${t('variation')}</p></details><details style="margin-top:12px"><summary>${t('glossary')}</summary><div class="terms">${terms.map(a=>`<span>${a[lang==='zh'?0:1]} — ${a[lang==='zh'?1:0]}</span>`).join('')}</div></details></section><footer>${t('footer')}</footer>`;
 for(const svg of document.querySelectorAll('svg[data-kind]')){const old=retained.get(svg.dataset.kind);if(old)svg.replaceWith(old);}
 bind();paint();document.querySelectorAll('svg[data-kind]').forEach(fitAnnotations);if(focused)document.getElementById(focused)?.focus({preventScroll:true});}
function stop(){s.playing=false;cancelAnimationFrame(timer);previousTime=null;}
function frameTick(now) {
  if(!s.playing)return;
  if(previousTime!==null&&!document.hidden)s.position=Math.min(animationTarget,advancePosition(s.position,now-previousTime,s.speed));
  previousTime=now;
  if(s.position>=animationTarget)stop();
  paint();
  if(s.playing)timer=requestAnimationFrame(frameTick);
}
function start(target=8){stop();if(s.position>=8)s.position=0;animationTarget=target;s.playing=true;timer=requestAnimationFrame(frameTick);}
function step(){stop();const next=Math.min(8,Math.floor(s.position+1e-8)+1);if(s.reduced)s.position=next;else start(next);}
function csv(){if(!s.records.length)return;const rows=[[t('trial'),t('mitosis')+'/'+t('meiosis'),t('stage'),t('scope'),t('chromosomes'),t('joinedSisters')+' (t)',t('dna'),t('orientation'),t('crossCSV'),t('result'),t('time')],...s.records.map((r,i)=>[i+1,t(r.kind),phaseName(r.kind,r.position),t('cell'),r.counting.count[0],r.counting.chromatids,r.counting.count[1],r.flips.map(x=>x?'P|M':'M|P').join(';'),t(r.cross?'on':'off'),JSON.stringify(r.snap.cells),r.position])];const blob=new Blob(['\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=lang==='zh'?'細胞分裂觀察.csv':'cell-division-observations.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function bind(){const on=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=()=>{fn();render()}};['explore','challenge'].forEach(m=>on(m,()=>s.mode=m));['mitosis','meiosis'].forEach(k=>on(k,()=>s.kind=k));on('compare',()=>s.compare=!s.compare);on('labels',()=>s.labels=!s.labels);on('play',()=>s.playing?stop():start());on('step',step);on('replay',()=>{stop();s.event=0;s.position=0});on('reset',()=>{stop();Object.assign(s,{event:0,position:0,flips:[false,false],cross:false,selected:null})});on('random',()=>{stop();s.flips=[Math.random()<.5,Math.random()<.5];s.event=0;s.position=0});[0,1].forEach(i=>on('flip'+i,()=>s.flips[i]=!s.flips[i]));on('record',()=>s.records.push(structuredClone({kind:s.kind,event:s.event,position:s.position,frame:sceneAt(s.kind,s.position,s.flips,s.cross),counting:countsAt(s.kind,s.position),flips:s.flips,cross:s.kind==='meiosis'&&s.cross,snap:snapshot(s.kind,s.event,s.flips,s.cross),elapsedEvent:s.position,selection:s.selected})));on('clear',()=>s.records=[]);on('download',csv);on('check',()=>{if(s.choice!==null)s.attempt=true});document.getElementById('check').disabled=s.choice===null;document.getElementById('download').disabled=!s.records.length;on('hint',()=>s.hint++);on('reveal',()=>s.reveal=true);on('qnext',()=>{s.q=(s.q+1)%5;Object.assign(s,{choice:null,attempt:false,reveal:false,hint:0,response:''})});document.getElementById('response').oninput=e=>s.response=e.target.value;document.getElementById('timeline').oninput=e=>{stop();s.position=+e.target.value;paint()};document.getElementById('speed').onchange=e=>{s.speed=+e.target.value;paint()};['cross','alleles','reduced'].forEach(k=>document.getElementById(k).onchange=e=>{s[k]=e.target.checked;render()});document.querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{s.choice=+el.dataset.choice;render()});document.querySelectorAll('[data-chrom]').forEach(el=>{const choose=()=>{s.selected=el.dataset.chrom;render()};el.onclick=choose;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}}});}
['zh','en'].forEach(l=>document.getElementById(l).onclick=()=>{lang=l;try{localStorage.setItem('cell-language',l)}catch{}render()});
render();
document.addEventListener('visibilitychange',()=>{previousTime=null;});

window.addEventListener('resize',()=>document.querySelectorAll('svg[data-kind]').forEach(fitAnnotations));
