import {test} from 'node:test';
import assert from 'node:assert/strict';
import {snapshot,products,chrom,countsAt} from '../model.mjs';
import {dict} from '../i18n.mjs';
test('five stable centromere-based checkpoints',()=>{for(const [kind,e,count,n,rep] of [['mitosis',0,[4,4],1,false],['mitosis',1,[4,8],1,true],['mitosis',8,[4,4],2,false],['meiosis',5,[2,4],2,true],['meiosis',8,[2,2],4,false]]){const v=snapshot(kind,e);assert.deepEqual(v.count,count);assert.equal(v.cells.length,n);assert.equal(v.replicated,rep);for(const cell of v.cells){assert.equal(cell.length,count[0]);assert.equal(cell.length*(rep?2:1),count[1]);}}});
test('all orientations preserve homologues in I and split sisters in II without replication',()=>{for(const flips of [[false,false],[false,true],[true,false],[true,true]]){const first=snapshot('meiosis',5,flips);assert.equal(first.replicated,true);assert.deepEqual(snapshot('meiosis',6,flips),first);for(let i=0;i<2;i++){assert.deepEqual(first.cells[i].map(c=>c.pair),[1,2]);const last=products('meiosis',flips);for(let j=0;j<2;j++)assert.deepEqual(last[i*2+j].map(c=>c.id),first.cells[i].map(c=>c.id));assert.ok(last[i*2].every(c=>c.sister===0));assert.ok(last[i*2+1].every(c=>c.sister===1));}assert.equal(snapshot('meiosis',7,flips).scope,'pole');}});
test('reciprocal non-sister exchange conserves locus order and allele totals',()=>{const off=products('meiosis',[false,false],false).flat(),on=products('meiosis',[false,false],true).flat();for(let locus=0;locus<2;locus++)for(const origin of ['M','P'])assert.equal(on.filter(c=>c.loci[locus]===origin).length,off.filter(c=>c.loci[locus]===origin).length);const changed=on.filter((c,i)=>c.loci.join('')!==off[i].loci.join(''));assert.deepEqual(changed.map(c=>[c.id,c.sister]).sort(),[['M1',1],['P1',0]]);assert.deepEqual(chrom('M1',1,true).loci,['M','P']);assert.deepEqual(chrom('P1',0,true).loci,['P','M']);});
test('four combinations across runs, only two without crossing over in one run',()=>{const all=new Set();for(const flips of [[false,false],[false,true],[true,false],[true,true]]){const run=products('meiosis',flips).map(c=>c.map(a=>a.origin).join(''));assert.equal(new Set(run).size,2);run.forEach(x=>all.add(x));}assert.equal(all.size,4);});
test('mitosis has identical genetic information and ignores meiotic controls',()=>{assert.deepEqual(products('mitosis',[true,false],true).map(cell=>cell.map(c=>[c.id,c.loci])),products('mitosis').map(cell=>cell.map(c=>[c.id,c.loci])));});
test('both languages have matching stable content IDs',()=>assert.deepEqual(Object.keys(dict.zh).sort(),Object.keys(dict.en).sort()));

test('per-cell totals distinguish joined sisters from DNA molecules',()=>{
 assert.deepEqual(countsAt('mitosis',0).count,[4,4]);assert.equal(countsAt('mitosis',0).chromatids,0);
 for(const kind of ['mitosis','meiosis'])assert.equal(countsAt(kind,2.5).chromatids,8);
 assert.deepEqual(countsAt('mitosis',3.5).count,[8,8]);assert.equal(countsAt('mitosis',3.5).chromatids,0);
 assert.equal(countsAt('mitosis',3.5).perPole.chromatids,0);
 assert.deepEqual(countsAt('meiosis',3.5).count,[4,8]);assert.equal(countsAt('meiosis',3.5).chromatids,8);
 assert.equal(countsAt('meiosis',3.5).perPole.chromatids,4);
 assert.equal(countsAt('meiosis',5.5).chromatids,4);
 assert.deepEqual(countsAt('meiosis',6.5).count,[4,4]);assert.equal(countsAt('meiosis',6.5).chromatids,0);
 assert.deepEqual(countsAt('meiosis',8).count,[2,2]);assert.equal(countsAt('meiosis',8).chromatids,0);
});

test('all fifteen rows match the supplied human reference scaled from 46 to 4 chromosomes',()=>{
 const rows=[
 ['mitosis',1.5,46,92,92],['mitosis',2.5,46,92,92],['mitosis',3.5,92,0,92],['mitosis',4.15,92,0,92],['mitosis',5,46,0,46],
 ['meiosis',1.5,46,92,92],['meiosis',2.5,46,92,92],['meiosis',3.5,46,92,92],['meiosis',4.15,46,92,92],['meiosis',5,23,46,46],
 ['meiosis',5.1,23,46,46],['meiosis',5.6,23,46,46],['meiosis',6.5,46,0,46],['meiosis',7.15,46,0,46],['meiosis',8,23,0,23]
 ];
 for(const [kind,p,chromosomes,joined,dna] of rows){const info=countsAt(kind,p);assert.deepEqual([info.count[0],info.chromatids,info.count[1]].map(v=>v*46/4),[chromosomes,joined,dna]);}
});
