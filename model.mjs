export const ids=['M1','P1','M2','P2'];
export function chrom(id,sister=0,cross=false){const pair=+id[1],origin=id[0];return {id,pair,origin,sister,loci:[origin, cross&&pair===1&&((origin==='M'&&sister===1)||(origin==='P'&&sister===0))?(origin==='M'?'P':'M'):origin]};}
export function products(kind,flips=[false,false],cross=false){if(kind==='mitosis')return [0,1].map(s=>ids.map(id=>chrom(id,s,false)));return [0,1].flatMap(pole=>[0,1].map(s=>[1,2].map((pair,i)=>chrom(`${(pole===0)!==flips[i]?'M':'P'}${pair}`,s,cross))));}
export function snapshot(kind,event,flips=[false,false],cross=false){
 const replicated=event>0;
 if(event===0)return {cells:[ids.map(id=>chrom(id))],replicated:false,count:[4,4],scope:'cell',separation:null};
 if(event<4)return {cells:[ids.map(id=>chrom(id,0,kind==='meiosis'&&cross&&event>=2))],replicated,count:[4,8],scope:'cell',separation:null};
 if(kind==='mitosis')return {cells:products(kind),replicated:false,count:[4,4],scope:event===4?'pole':'daughter',separation:event===4?'sisters':null};
 if(event<7)return {cells:[0,1].map(pole=>[1,2].map((pair,i)=>chrom(`${(pole===0)!==flips[i]?'M':'P'}${pair}`,0,cross))),replicated:true,count:[2,4],scope:event===4?'pole':'daughter',separation:event===4?'homologues':null};
 return {cells:products(kind,flips,cross),replicated:false,count:[2,2],scope:event===7?'pole':'product',separation:event===7?'sisters':null};
}
