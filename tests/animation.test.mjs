import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sceneAt,advancePosition} from '../animation.mjs';
import {clearance} from './helpers/clearance.mjs';
import {products} from '../model.mjs';

const close=(a,b,tolerance=1e-5)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≠ ${b}`);
const strand=(scene,key)=>scene.strands.find(a=>a.key===key);

test('first separation follows upper/lower spindle poles; sisters stay together in meiosis I',()=>{
  for(const kind of ['mitosis','meiosis']) {
    const before=sceneAt(kind,3),middle=sceneAt(kind,3.5),after=sceneAt(kind,4);
    const key=kind==='mitosis'?'M1-s0':'M1-s0';
    close(strand(before,key).x,strand(after,key).x);
    assert.ok(strand(before,key).y>strand(middle,key).y);
    assert.ok(strand(middle,key).y>strand(after,key).y);
    const upper=middle.spindles.find(a=>a.key===key);
    assert.ok(upper.y<upper.toY);
    if(kind==='meiosis') {
      for(const p of [3.1,3.5,3.9,4]) {
        const frame=sceneAt(kind,p);
        for(const id of ['M1','P1','M2','P2']) {
          const a=strand(frame,id+'-s0'),b=strand(frame,id+'-s1');
          close(a.x,b.x);close(a.y,b.y);
        }
      }
    } else {
      assert.ok(strand(after,'M1-s0').y<strand(after,'M1-s1').y);
      assert.ok(strand(after,'M1-s0').topY>0); // upper centromere leads trailing arms
      assert.ok(strand(after,'M1-s1').bottomY<0);
    }
  }
});

test('all chromosome and exchanged-segment tracks are continuous across stage boundaries',()=>{
  for(const kind of ['mitosis','meiosis'])for(const cross of [false,true])for(const flips of [[false,false],[true,false],[false,true],[true,true]]) {
    const baseline=sceneAt(kind,0,flips,cross).strands.map(a=>a.key);
    for(let event=1;event<8;event++) {
      const a=sceneAt(kind,event-1e-6,flips,cross),b=sceneAt(kind,event+1e-6,flips,cross);
      assert.deepEqual(b.strands.map(a=>a.key),baseline);
      for(const group of ['strands','distal'])for(let i=0;i<8;i++) {
        for(const coordinate of ['x','y','topX','topY','bottomX','bottomY','opacity'])close(a[group][i][coordinate],b[group][i][coordinate],.001);
      }
      for(let i=0;i<a.membranes.length;i++)close(a.membranes[i].opacity,b.membranes[i].opacity,.001);
    }
  }
});

test('all visible arms and reciprocal segments preserve their length during motion',()=>{
  for(const kind of ['mitosis','meiosis'])for(let p=0;p<=8;p+=.025){
    const frame=sceneAt(kind,p,[false,true],true);
    for(const a of [...frame.strands,...frame.distal]){
      close(Math.hypot(a.topX,a.topY),a.length/2);
      close(Math.hypot(a.bottomX,a.bottomY),a.length/2);
      assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y));
    }
  }
});

test('final visual lineage and distal ancestry agree with biological products for every orientation',()=>{
  for(const flips of [[false,false],[true,false],[false,true],[true,true]])for(const cross of [false,true]) {
    const frame=sceneAt('meiosis',8,flips,cross);
    const groups=products('meiosis',flips,cross);
    groups.forEach((cell,index)=>cell.forEach(a=>{
      const node=strand(frame,`${a.id}-s${a.sister}`),piece=frame.distal.find(d=>d.recipient===node.key);
      assert.equal(node.y,index<2?115:325);
      assert.equal(node.x<300,index%2===0);
      assert.equal(piece.origin,a.loci[1]);
      close(piece.x,node.x);close(piece.y,node.y);
    }));
  }
});

test('frame-rate and playback speed only change the viewing position, not final outcomes',()=>{
  close(advancePosition(3,1200,2400),3.5);
  close(advancePosition(3,2400,2400),advancePosition(3,1200,1200));
  let position=0;for(let i=0;i<600;i++)position=advancePosition(position,16,1200);
  assert.equal(position,8);
  assert.deepEqual(sceneAt('meiosis',position,[true,false],true),sceneAt('meiosis',8,[true,false],true));
});

test('without crossing over, distinct chromosomes never overlap along the full animation',()=>{
 for(const kind of ['mitosis','meiosis'])for(const flips of [[false,false],[false,true],[true,false],[true,true]]){
  for(let i=0;i<=800;i++){
   const frame=sceneAt(kind,i/100,flips,false),space=clearance(frame);
   assert.ok(space.min>9+3*frame.chromatin,`${kind}, ${flips}, event ${i/100}: ${space.pair} must remain separate`);
  }
 }
});

test('metaphase uses the spindle equator: individual chromosomes in mitosis/II and homologous pairs in I',()=>{
 const mitosis=sceneAt('mitosis',2.5),first=sceneAt('meiosis',2.5),second=sceneAt('meiosis',6);
 assert.ok(mitosis.strands.every(a=>a.y===220));
 assert.ok(mitosis.strands.every(a=>Math.abs(a.topX)>Math.abs(a.topY)));
 for(const pair of [1,2]){const homologues=first.strands.filter(a=>a.pair===pair&&a.sister===0);assert.equal(homologues[0].x,homologues[1].x);assert.equal((homologues[0].y+homologues[1].y)/2,220);}
 assert.ok(second.strands.every(a=>a.x===300));
 assert.equal(mitosis.equators[0].opacity,1);
 assert.equal(second.equators.filter(a=>a.opacity===1).length,2);
});
