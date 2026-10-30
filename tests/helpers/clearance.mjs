// Minimum distance between arms of distinct chromosome identities.
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
function pointDistance(p,a,b){const ab=sub(b,a),f=Math.max(0,Math.min(1,dot(sub(p,a),ab)/(dot(ab,ab)||1)));return Math.hypot(p.x-a.x-f*ab.x,p.y-a.y-f*ab.y)}
function distance(a,b,c,d){const cross=(u,v)=>u.x*v.y-u.y*v.x,r=sub(b,a),s=sub(d,c),den=cross(r,s);if(Math.abs(den)>1e-8){const t=cross(sub(c,a),s)/den,u=cross(sub(c,a),r)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return 0}return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b))}
export function clearance(frame){const arms=frame.strands.filter(a=>a.opacity>.05).flatMap(a=>[[{x:a.x+a.topX,y:a.y+a.topY},{x:a.x,y:a.y}],[{x:a.x,y:a.y},{x:a.x+a.bottomX,y:a.y+a.bottomY}]].map(points=>({id:a.id,points})));let min=Infinity,pair;for(let i=0;i<arms.length;i++)for(let j=i+1;j<arms.length;j++){if(arms[i].id===arms[j].id)continue;const d=distance(...arms[i].points,...arms[j].points);if(d<min){min=d;pair=[arms[i].id,arms[j].id]}}return {min,pair}}
