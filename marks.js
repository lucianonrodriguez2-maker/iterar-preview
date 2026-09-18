/* ITERAR — geometría de los isotipos. Compartido por el laboratorio (navegador) y el exportador (Node). */
(function(root){
let INK='currentColor', ACC='var(--accent)';
const f = n => (Math.round(n*100)/100).toString();
const pt = (r,deg) => { const a=(deg-90)*Math.PI/180; return [r*Math.cos(a), r*Math.sin(a)]; };
const P = (r,deg) => pt(r,deg).map(f).join(' ');

/* trazo que engorda a lo largo de un recorrido polar */
function taper({r0,r1,d0,d1,w0,w1,n=220}){
  const C=[],L=[],R=[];
  for(let i=0;i<=n;i++){const t=i/n;C.push(pt(r0+(r1-r0)*t,d0+(d1-d0)*t));}
  for(let i=0;i<=n;i++){
    const a=C[Math.max(0,i-1)],b=C[Math.min(n,i+1)];
    let tx=b[0]-a[0],ty=b[1]-a[1];const m=Math.hypot(tx,ty);tx/=m;ty/=m;
    const w=(w0+(w1-w0)*(i/n))/2;
    L.push([C[i][0]-ty*w,C[i][1]+tx*w]);R.push([C[i][0]+ty*w,C[i][1]-tx*w]);
  }
  const s=p=>f(p[0])+' '+f(p[1]);
  return 'M'+L.map(s).join('L')
    +`A${f(w1/2)} ${f(w1/2)} 0 0 0 ${s(R[n])}`
    +'L'+R.slice(0,n).reverse().map(s).join('L')
    +`A${f(w0/2)} ${f(w0/2)} 0 0 0 ${s(L[0])}Z`;
}
const arcTo=(r,d1,large)=>`A${r} ${r} 0 ${large} 1 ${P(r,d1)}`;

const arc=(r,d0,d1)=>`M${P(r,d0)}A${r} ${r} 0 ${(d1-d0)>180?1:0} 1 ${P(r,d1)}`;
const MARKS = {
  A(){ // vuelta abierta
    const end=-28+360*1.17;
    const d=taper({r0:21,r1:40,d0:-28,d1:end,w0:2.2,w1:12});
    const e=pt(40,end);
    return `<g class="c spin-mid"><path d="${d}" fill="${INK}"/><circle cx="${f(e[0])}" cy="${f(e[1])}" r="6" fill="${ACC}"/></g>`;
  },
  B(){ // relevo
    const sw=8.5,st=`fill="none" stroke-width="${sw}" stroke-linecap="round"`;
    return `<g class="c"><path pathLength="1" class="draw d1" d="${arc(14,0,105)}" stroke="${INK}" ${st}/>
      <path pathLength="1" class="draw d2" d="${arc(27,105,300)}" stroke="${INK}" ${st}/>
      <path pathLength="1" class="draw d3" d="${arc(40,300,300+285)}" stroke="${ACC}" ${st}/></g>`;
  },
  C(){ // de tosco a preciso: escalera que se vuelve curva
    const r=37,angs=[0,32,62,90,114,135,153,168,180];
    let d='M'+P(r,0);
    for(let i=1;i<angs.length;i++){const p0=pt(r,angs[i-1]),p1=pt(r,angs[i]);
      d+= angs[i]<=90 ? `L${f(p1[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}` : `L${f(p0[0])} ${f(p1[1])}L${f(p1[0])} ${f(p1[1])}`;}
    d+=`A${r} ${r} 0 0 1 ${P(r,360)}`;
    return `<g class="c spin-slow"><path d="${d}" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="miter" stroke-linecap="butt"/><circle cx="0" cy="-37" r="6" fill="${ACC}"/></g>`;
  },
  D(){ // tres vueltas desde el mismo punto
    const R=[14,26,40],W=[3.2,5.4,8];let o='';
    R.forEach((r,i)=>{o+=`<circle cx="0" cy="${f(40-r)}" r="${r-W[i]/2}" fill="none" stroke="${INK}" stroke-width="${W[i]}"/>`;});
    return `<g class="c spin-mid"><g transform="rotate(-140)">${o}<circle cx="0" cy="40" r="6.2" fill="${ACC}"/></g></g>`;
  },
  E(){ // remolino
    const a=14,s=1/(Math.cos(a*Math.PI/180)+Math.sin(a*Math.PI/180));let out='';
    const N=6;
    for(let i=N-1;i>=0;i--){const h=40*Math.pow(s,i);const w=4.2-2.6*(i/(N-1));
      out+=`<rect class="c tw" style="--a:${i*a}deg" transform="rotate(${i*a})" x="${f(-h)}" y="${f(-h)}" width="${f(2*h)}" height="${f(2*h)}" fill="none" stroke="${i===N-1?ACC:INK}" stroke-width="${f(w)}"/>`;}
    return `<g>${out}</g>`;
  },
  F(){ // la I iterada
    let out='';
    for(let i=0;i<12;i++){const k=(i+11)%12;const ro=22+22*(k/11);const p0=pt(14,i*30),p1=pt(ro,i*30);
      out+=`<line x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}" stroke="${i===0?ACC:INK}" stroke-width="5.2" stroke-linecap="round"/>`;}
    return `<g class="c spin-step">${out}</g>`;
  }
};
function mark(k,opts){ INK=(opts&&opts.ink)||'currentColor'; ACC=(opts&&opts.accent)||'var(--accent)'; return MARKS[k](); }
const api={mark,keys:Object.keys(MARKS),taper,pt};
if(typeof module!=='undefined'&&module.exports) module.exports=api; else root.ITERAR=api;
})(typeof globalThis!=='undefined'?globalThis:this);
