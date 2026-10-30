import {test} from 'node:test';
import assert from 'node:assert/strict';
import {phaseAt,phaseSource} from '../phases.mjs';
import {sceneAt} from '../animation.mjs';
import {countsAt} from '../model.mjs';

test('phase labels follow replication, alignment, separation, nuclear re-formation and cleavage',()=>{
  for(const kind of ['mitosis','meiosis'])for(const [position,key] of [[0,'interphaseName'],[1,'interphaseName'],[1.5,'prophase'],[2.5,'metaphase'],[3,'metaphase'],[3.5,'anaphase'],[4.15,'telophase'],[4.6,'cytokinesis']]){
    assert.equal(phaseAt(kind,position).key,key);
    assert.equal(phaseAt(kind,position).division,kind==='meiosis'&&position>1?'I':'');
  }
  assert.equal(phaseAt('mitosis',5).key,'divisionComplete');
  for(const [position,key] of [[5.1,'prophase'],[5.6,'metaphase'],[6.5,'anaphase'],[7.15,'telophase'],[7.6,'cytokinesis']])assert.deepEqual(phaseAt('meiosis',position),{key,division:'II'});
  assert.equal(phaseAt('meiosis',8).key,'divisionComplete');
});

test('nuclear envelopes re-form in telophase, then disappear before second separation',()=>{
  const visible=(kind,p)=>sceneAt(kind,p).nuclei.filter(a=>a.opacity>.9).length;
  assert.equal(visible('mitosis',3),0);
  assert.equal(visible('mitosis',4.3),2);
  assert.equal(visible('mitosis',5),2);
  assert.equal(visible('meiosis',5),2);
  assert.equal(visible('meiosis',6),0);
  assert.equal(visible('meiosis',7.3),4);
  assert.equal(visible('meiosis',8),4);
});

test('textbook sequence: interphase chromatin, prophase envelope breakdown and spindle formation, telophase uncoiling',()=>{
 for(const kind of ['mitosis','meiosis']){
  const interphase=sceneAt(kind,0),prophase=sceneAt(kind,1.5),metaphase=sceneAt(kind,2.5);
  assert.equal(interphase.chromatin,1);
  assert.equal(interphase.nuclei.find(a=>a.key==='parent-nucleus').opacity,1);
  assert.ok(prophase.nuclei.find(a=>a.key==='parent-nucleus').opacity<1);
  assert.ok(prophase.spindles.some(a=>a.opacity>0));
  assert.equal(metaphase.chromatin,0);
  assert.equal(metaphase.nuclei.find(a=>a.key==='parent-nucleus').opacity,0);
 }
 assert.ok(sceneAt('mitosis',4.3).chromatin>0);
 assert.equal(sceneAt('mitosis',5).chromatin,1);
 assert.equal(sceneAt('meiosis',5).chromatin,0); // replicated chromosomes remain traceable between divisions
 assert.ok(sceneAt('meiosis',7.3).chromatin>0);
 assert.equal(sceneAt('meiosis',8).chromatin,1);
});

test('phase descriptions cite the inspected printed textbook pages',()=>{
 for(const kind of ['mitosis','meiosis'])assert.equal(phaseSource(kind,0),'12-7');
 for(const p of [1.5,2.5,3.5,4.15])assert.equal(phaseSource('mitosis',p),'12-8');
 assert.equal(phaseSource('mitosis',4.6),'12-9');
 for(const p of [1.5,2.5,3.5,4.15,4.6])assert.equal(phaseSource('meiosis',p),'12-14');
 for(const p of [5.1,5.6,6.5,7.15,7.6])assert.equal(phaseSource('meiosis',p),'12-15');
});

test('replication is complete by the end of interphase; condensation completes in early prophase',()=>{
 for(const kind of ['mitosis','meiosis']){
  assert.equal(phaseAt(kind,1).key,'interphaseName');
  assert.deepEqual(countsAt(kind,1).count,[4,8]);
  assert.deepEqual(countsAt(kind,1.35).count,[4,8]);
  assert.equal(sceneAt(kind,1).chromatin,1);
  assert.equal(phaseAt(kind,1.35).key,'prophase');
  assert.equal(sceneAt(kind,1.35).chromatin,0);
  assert.equal(sceneAt(kind,2.5).chromatin,0);
 }
});
