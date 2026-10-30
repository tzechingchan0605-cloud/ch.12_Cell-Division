import {test} from 'node:test';
import assert from 'node:assert/strict';
import {phaseAt} from '../phases.mjs';
import {sceneAt} from '../animation.mjs';

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
