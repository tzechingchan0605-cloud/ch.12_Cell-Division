// Phase names are navigation aids for the continuous schematic, not timing data.
export function phaseAt(kind, position) {
  const p=Math.max(0,Math.min(8,position));
  if(p<=1)return {key:'interphaseName',division:''};
  if(p<=2)return {key:'prophase',division:kind==='meiosis'?'I':''};
  if(p<=3)return {key:'metaphase',division:kind==='meiosis'?'I':''};
  if(p<=4)return {key:'anaphase',division:kind==='meiosis'?'I':''};
  if(p<4.35)return {key:'telophase',division:kind==='meiosis'?'I':''};
  if(p<5)return {key:'cytokinesis',division:kind==='meiosis'?'I':''};
  if(kind==='mitosis')return {key:'divisionComplete',division:''};
  if(p<5.45)return {key:'prophase',division:'II'};
  if(p<=6)return {key:'metaphase',division:'II'};
  if(p<=7)return {key:'anaphase',division:'II'};
  if(p<7.35)return {key:'telophase',division:'II'};
  if(p<8)return {key:'cytokinesis',division:'II'};
  return {key:'divisionComplete',division:''};
}
