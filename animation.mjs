import {ids} from './model.mjs';

// Positions are schematic. Every chromatid retains the same key for the entire run.
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
export const advancePosition = (position, elapsed, duration) => Math.min(8, position + Math.max(0, elapsed) / duration);

function keyframe(kind, event, flips) {
  return ids.flatMap((id, index) => [0, 1].map(sister => {
    const pair = Number(id[1]);
    const pole = (id[0] === 'M') !== flips[pair - 1] ? 0 : 1;
    const length=pair===1?72:48;
    let x = [155, 410, 210, 395][index], y = [140, 150, 290, 285][index];
    const bend = event === 0 ? 0 : (sister === 0 ? -13 : 13);
    let topX=bend,topY=-length/2,bottomX=bend,bottomY=length/2;
    const opacity = event === 0 && sister === 1 ? 0 : 1;
    if (event >= 2) {
      x = kind === 'meiosis' ? (pair===1?200:400) : 125+index*115;
      y = kind === 'meiosis' ? 220+(pole===0?-25:25) : 220;
    }
    if (event >= 4) {
      y = kind === 'meiosis' ? (pole === 0 ? 115 : 325) : (sister === 0 ? 115 : 325);
      if(kind==='mitosis') {
        // The centromere leads; both arms trail towards the equator.
        const arm=length/(2*Math.sqrt(2));
        topX=-arm;bottomX=arm;topY=bottomY=sister===0?arm:-arm;
        if(event>=5){topX=bottomX=0;topY=-length/2;bottomY=length/2;}
      }
    }
    if (event >= 6 && kind === 'meiosis') {
      x=300;y=(pole===0?115:325)+(pair===1?-38:38);
    }
    if (event >= 7 && kind === 'meiosis') {
      x=sister===0?155:445;
      const arm=length/(2*Math.sqrt(2));
      topX=bottomX=sister===0?arm:-arm;topY=-arm;bottomY=arm;
    }
    if(event>=8&&kind==='meiosis') {
      x+=(pair===1?-39:39);y=pole===0?115:325;
      topX=bottomX=0;topY=-length/2;bottomY=length/2;
    }
    return {key: `${id}-s${sister}`, id, sister, pair, origin: id[0], x, y,
      length, topX,topY,bottomX,bottomY,opacity};
  }));
}

// Keep arm lengths constant while changing their orientation.
function interpolateStrand(a,b,t) {
  const result={...a};
  for(const key of ['x','y','topX','topY','bottomX','bottomY','opacity'])result[key]=mix(a[key],b[key],t);
  for(const arm of ['top','bottom']) {
    const size=Math.hypot(result[arm+'X'],result[arm+'Y']);
    result[arm+'X']*=a.length/2/size;result[arm+'Y']*=a.length/2/size;
  }
  return result;
}

// Sample the membrane itself, so the cleavage furrow narrows continuously.
function boundary(cx, cy, rx, ry, pinch = 0, vertical = false) {
  const points = Array.from({length: 97}, (_, i) => {
    const a = i / 96 * Math.PI * 2;
    let dx = rx * Math.cos(a), dy = ry * Math.sin(a);
    const axis = vertical ? dy / ry : dx / rx;
    const neck = 1 - pinch * Math.exp(-Math.pow(axis / .24, 2));
    if (vertical) dx *= neck; else dy *= neck;
    return `${i ? 'L' : 'M'} ${(cx + dx).toFixed(3)} ${(cy + dy).toFixed(3)}`;
  });
  return points.join(' ') + ' Z';
}
function membranesAt(kind, position) {
  const growth = ease(Math.min(position, 1));
  const first = ease(position - 4);
  const second = kind === 'meiosis' ? ease(position - 7) : 0;
  const fadeFirst = ease((first - .78) / .22),fadeSecond = ease((second - .78) / .22);
  const membranes = [{key:'parent', path:boundary(300,220,mix(260,280,growth),mix(182,195,growth),first,true), opacity:1-fadeFirst}];
  [115,325].forEach((cy, i) => {
    membranes.push({key:`daughter-${i}`, path:boundary(300,cy,280,90,second), opacity:fadeFirst*(1-fadeSecond)});
    [155,445].forEach((cx,j) => membranes.push({key:`product-${i}-${j}`,path:boundary(cx,cy,132,90),opacity:fadeSecond}));
  });
  return membranes;
}

function nucleiAt(kind,p) {
  const first=ease((p-4)/.3)*(kind==='meiosis'?1-ease((p-5)/.45):1);
  const second=kind==='meiosis'?ease((p-7)/.3):0;
  return [{key:'parent-nucleus',path:boundary(300,220,245,165),opacity:1-ease(p-1)},...[115,325].flatMap((cy,i)=>[
    {key:`first-${i}`,path:boundary(300,cy,248,67),opacity:first},
    ...[155,445].map((cx,j)=>({key:`second-${i}-${j}`,path:boundary(cx,cy,110,65),opacity:second}))
  ])];
}

export function sceneAt(kind, position, flips = [false,false], crossing = false) {
  const p = Math.max(0, Math.min(8, position));
  const event = Math.min(7, Math.floor(p)), progress = p - event;
  // Pair homologues first, then exchange corresponding distal segments.
  const exchange = kind === 'meiosis' && crossing && event === 1;
  const fraction = ease(exchange ? progress / .65 : progress);
  const before = keyframe(kind, event, flips), after = keyframe(kind, event + 1, flips);
  const strands = before.map((a,i) => interpolateStrand(a,after[i],fraction));
  const exchanged = kind === 'meiosis' && crossing ? ease((p-1.65)/.35) : 0;
  const distal = strands.map(a => {
    const partner = a.key==='M1-s1' ? 'P1-s0' : a.key==='P1-s0' ? 'M1-s1' : a.key;
    const b = strands.find(other=>other.key===partner);
    return {...interpolateStrand(a,b,exchanged),
      recipient: exchanged===1 ? partner : a.key};
  });
  const attached = kind==='mitosis' ? 1-ease(p-3) : 1-ease(p-6);
  const spindleI = ease(p-1)*(1-ease(p-4));
  const spindleII = kind==='meiosis' ? ease(p-5)*(1-ease(p-7)) : 0;
  const spindles = strands.map(a=>{
    const pole = (a.origin==='M')!==flips[a.pair-1] ? 0 : 1;
    let x=300,y=kind==='mitosis'?(a.sister===0?25:415):(pole===0?25:415);
    let opacity=spindleI;
    if(p>=5 && kind==='meiosis'){ x=a.sister===0?25:575; y=pole===0?115:325; opacity=spindleII; }
    return {key:a.key,x,y,toX:a.x,toY:a.y,opacity:opacity*a.opacity};
  });
  const chromatin=Math.max(1-ease(p-1),kind==='mitosis'?ease((p-4)/.6):ease((p-7)/.6));
  return {position:p,chromatin,strands,distal,membranes:membranesAt(kind,p),nuclei:nucleiAt(kind,p),spindles,attached};
}
