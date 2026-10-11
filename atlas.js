/* Aesthetic Atlas engine: layout, drawings, map, learn mode. Needs data.js loaded first. */
const DOM={a:["Architecture","--a"],i:["Interiors","--i"],f:["Fashion","--f"],g:["Art & graphic","--g"],d:["Digital","--d"]};
const S=RAW.map(r=>({id:r[0],n:r[1],y0:r[2],y1:r[3],d:r[4],p:r[5].split(","),m:r[6],s:r[7],look:r[8].split("|"),ex:r[9].split("|"),term:r[10],def:r[11],x:r[12]||""}));
const BY=Object.fromEntries(S.map(s=>[s.id,s]));
function hash(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* LAYOUT */
function layoutConstellation(){
  const A={a:[-430,-260],i:[430,-260],f:[500,250],g:[-500,250],d:[0,520]};
  const pos={},ids=S.map(s=>s.id),N=ids.length;
  S.forEach(s=>{let ax=0,ay=0,w=0;[...s.d].forEach((c,j)=>{const k=j?1:2.4;ax+=A[c][0]*k;ay+=A[c][1]*k;w+=k});
    const r=rng(hash(s.id));pos[s.id]={x:ax/w+(r()-.5)*260,y:ay/w+(r()-.5)*260,ax:ax/w,ay:ay/w}});
  for(let it=0;it<700;it++){
    const t=1-it/700,F={};ids.forEach(id=>F[id]={x:0,y:0});
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const a=pos[ids[i]],b=pos[ids[j]];let dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||.01;let f=16000/(d*d);if(d<135)f+=(135-d)*.35;dx/=d;dy/=d;F[ids[i]].x+=dx*f;F[ids[i]].y+=dy*f;F[ids[j]].x-=dx*f;F[ids[j]].y-=dy*f}
    E.forEach(([a,b])=>{const p=pos[a],q=pos[b];let dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||.01;const f=(d-170)*.018;dx/=d;dy/=d;F[a].x+=dx*f;F[a].y+=dy*f;F[b].x-=dx*f;F[b].y-=dy*f});
    ids.forEach(id=>{const p=pos[id];F[id].x+=(p.ax-p.x)*.012;F[id].y+=(p.ay-p.y)*.012;const mag=Math.hypot(F[id].x,F[id].y)||1,step=Math.min(mag,4+28*t);p.x+=F[id].x/mag*step;p.y+=F[id].y/mag*step});
  }
  const out={};ids.forEach(id=>out[id]={x:pos[id].x,y:pos[id].y});return out;
}
const YX=y=>y<1900?(y-1100)*1.35:1080+(y-1900)*17;
function layoutTimeline(){
  const pos={},lanes=[];let top=0;
  for(const c of "aifgd"){
    const items=S.filter(s=>s.d[0]===c).sort((a,b)=>a.y0-b.y0),rows=[];
    items.forEach(s=>{const x=YX(s.y0);let r=rows.findIndex(last=>x-last>=128);if(r<0){r=rows.length;rows.push(-1e9)}rows[r]=x;pos[s.id]={x,y:top+78+r*96}});
    const h=Math.max(1,rows.length)*96+50;lanes.push({c,top,h});top+=h+14;
  }
  return {pos,lanes,height:top};
}
/*ENDLAYOUT*/

/* MOTIFS: procedural specimen plates drawn from each style's palette */
let UID=0;const uid=()=>"u"+(++UID);
const f1=n=>Math.round(n*10)/10;
const BG=(c,w,h)=>`<rect width="${w}" height="${h}" fill="${c}"/>`;
const M={
arches(w,h,P,r){let s=BG(P[0],w,h);const n=Math.max(2,Math.round(w/40)),cw=w/n;for(let i=0;i<n;i++){const x=i*cw,l=x+cw*.12,rr=x+cw*.88,m=x+cw/2,top=h*.1,sp=h*.5,l2=x+cw*.27,r2=x+cw*.73;
  s+=`<path d="M${f1(l)},${h} L${f1(l)},${f1(sp)} Q${f1(l)},${f1(h*.2)} ${f1(m)},${f1(top)} Q${f1(rr)},${f1(h*.2)} ${f1(rr)},${f1(sp)} L${f1(rr)},${h}Z" fill="${P[1]}"/>`;
  s+=`<path d="M${f1(l2)},${h} L${f1(l2)},${f1(sp+h*.05)} Q${f1(l2)},${f1(h*.3)} ${f1(m)},${f1(top+h*.11)} Q${f1(r2)},${f1(h*.3)} ${f1(r2)},${f1(sp+h*.05)} L${f1(r2)},${h}Z" fill="${P[2]}"/>`;
  s+=`<rect x="${f1(l2)}" y="${f1(sp+h*.12)}" width="${f1((r2-l2)/2)}" height="${f1(h*.12)}" fill="${P[3]}" opacity=".85"/><rect x="${f1(m)}" y="${f1(sp+h*.3)}" width="${f1((r2-l2)/2)}" height="${f1(h*.12)}" fill="${P[4]}" opacity=".8"/>`;
  s+=`<line x1="${f1(m)}" y1="${f1(top+h*.12)}" x2="${f1(m)}" y2="${h}" stroke="${P[1]}" stroke-width="${f1(cw*.05)}"/><circle cx="${f1(m)}" cy="${f1(sp-h*.04)}" r="${f1(cw*.11)}" fill="${P[3]}" stroke="${P[1]}" stroke-width="${f1(cw*.03)}"/>`}return s},
dome(w,h,P,r){let s=BG(P[0],w,h);const cx=w/2,R=Math.min(w*.32,h*.36),base=h*.6;
  s+=`<path d="M${f1(cx-R)},${f1(base)} A${f1(R)},${f1(R*.9)} 0 0 1 ${f1(cx+R)},${f1(base)}Z" fill="${P[2]}"/>`;
  for(let i=1;i<6;i++){const t=i/6,x=cx-R+2*R*t;s+=`<path d="M${f1(x)},${f1(base)} Q${f1(cx+(x-cx)*.5)},${f1(base-R*.85)} ${f1(cx)},${f1(base-R*.9)}" stroke="${P[4]}" stroke-width="${f1(R*.03)}" fill="none"/>`}
  s+=`<rect x="${f1(cx-R*.12)}" y="${f1(base-R*1.12)}" width="${f1(R*.24)}" height="${f1(R*.24)}" fill="${P[1]}"/>`;
  s+=`<rect x="0" y="${f1(base)}" width="${w}" height="${f1(h-base)}" fill="${P[1]}"/>`;
  const n=Math.max(3,Math.round(w/16)),cw=w/n;for(let i=0;i<n;i++){const x=i*cw+cw*.2,aw=cw*.6;s+=`<path d="M${f1(x)},${h} L${f1(x)},${f1(base+(h-base)*.45)} A${f1(aw/2)},${f1(aw/2)} 0 0 1 ${f1(x+aw)},${f1(base+(h-base)*.45)} L${f1(x+aw)},${h}Z" fill="${P[3]}"/>`}return s},
columns(w,h,P,r){let s=BG(P[0],w,h);const pt=h*.12,pb=h*.3,n=Math.max(4,Math.round(w/14)),mx=w*.08,cw=(w-2*mx)/n;
  s+=`<path d="M${f1(mx-4)},${f1(pb)} L${f1(w/2)},${f1(pt)} L${f1(w-mx+4)},${f1(pb)}Z" fill="${P[1]}" stroke="${P[2]}" stroke-width="1.2"/>`;
  s+=`<rect x="${f1(mx-4)}" y="${f1(pb)}" width="${f1(w-2*mx+8)}" height="${f1(h*.07)}" fill="${P[2]}"/>`;
  for(let i=0;i<n;i++){const x=mx+i*cw+cw*.22,cwid=cw*.56;s+=`<rect x="${f1(x)}" y="${f1(pb+h*.07)}" width="${f1(cwid)}" height="${f1(h*.5)}" fill="${P[1]}"/><line x1="${f1(x+cwid/2)}" y1="${f1(pb+h*.09)}" x2="${f1(x+cwid/2)}" y2="${f1(pb+h*.55)}" stroke="${P[2]}" stroke-width=".8"/>`}
  s+=`<rect x="${f1(mx-8)}" y="${f1(h*.87)}" width="${f1(w-2*mx+16)}" height="${f1(h*.06)}" fill="${P[2]}"/><rect x="${f1(mx-14)}" y="${f1(h*.93)}" width="${f1(w-2*mx+28)}" height="${f1(h*.07)}" fill="${P[3]}" opacity=".7"/>`;return s},
scroll(w,h,P,r){let s=BG(P[0],w,h);const n=Math.round(w*h/700)+3;for(let k=0;k<n;k++){const x=r()*w,y=r()*h,R=5+r()*12,dir=r()<.5?1:-1,c=P[1+Math.floor(r()*3)];let pts=[];for(let t=0;t<=10.5;t+=.35){const rad=R*(1-t/12);pts.push(f1(x+Math.cos(t*dir)*rad)+","+f1(y+Math.sin(t)*rad))}
  const tail=`${f1(x+R*dir)},${f1(y)} ${f1(x+R*2*dir)},${f1(y+R*.8)} ${f1(x+R*2.6*dir)},${f1(y+R*1.9)}`;s+=`<polyline points="${pts.join(" ")} " fill="none" stroke="${c}" stroke-width="${f1(R*.22)}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${tail}" fill="none" stroke="${c}" stroke-width="${f1(R*.18)}" stroke-linecap="round"/>`}return s},
vine(w,h,P,r){let s=BG(P[0],w,h);const g=22;for(let y=-g/2,row=0;y<h+g;y+=g,row++)for(let x=(row%2?g/2:0)-g/2;x<w+g;x+=g){const a=r()*360;
  s+=`<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(a)})"><path d="M0,0 Q6,-4 10,0 Q6,4 0,0Z" fill="${P[1]}"/><path d="M0,0 Q-6,-4 -10,0 Q-6,4 0,0Z" fill="${P[2]}" opacity=".85"/></g>`;
  if((row+Math.round(x))%3===0)s+=`<circle cx="${f1(x+g/2)}" cy="${f1(y+g/2)}" r="3.2" fill="${P[3]}"/><circle cx="${f1(x+g/2)}" cy="${f1(y+g/2)}" r="1.2" fill="${P[4]}"/>`}return s},
whiplash(w,h,P,r){let s=BG(P[0],w,h);for(let i=0;i<7;i++){const x0=r()*w,c=P[1+i%3],sw=1.5+r()*3.5;s+=`<path d="M${f1(x0)},${h+4} C${f1(x0+(r()-.5)*w*.7)},${f1(h*.65)} ${f1(r()*w)},${f1(h*.45)} ${f1(x0+(r()-.5)*w*.6)},${f1(h*.18)} S${f1(x0+(r()-.5)*w*.4)},${f1(-h*.05)} ${f1(r()*w)},${f1(h*.08)}" fill="none" stroke="${c}" stroke-width="${f1(sw)}" stroke-linecap="round"/>`}
  for(let k=0;k<3;k++){const cx=r()*w,cy=h*.15+r()*h*.5,R=4+r()*5;for(let p=0;p<5;p++){s+=`<ellipse cx="${f1(cx)}" cy="${f1(cy-R)}" rx="${f1(R*.45)}" ry="${f1(R)}" fill="${P[3]}" transform="rotate(${p*72} ${f1(cx)} ${f1(cy)})"/>`}s+=`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R*.4)}" fill="${P[4]}"/>`}return s},
diagonals(w,h,P,r){let s=BG(P[0],w,h);s+=`<path d="M${f1(w*.05)},${f1(h*.95)} L${f1(w*.95)},${f1(h*.15)} L${f1(w*.62)},${f1(h*.95)}Z" fill="${P[1]}"/>`;
  s+=`<circle cx="${f1(w*.26)}" cy="${f1(h*.32)}" r="${f1(Math.min(w,h)*.2)}" fill="none" stroke="${P[2]}" stroke-width="${f1(Math.min(w,h)*.05)}"/>`;
  s+=`<g transform="rotate(-32 ${f1(w/2)} ${f1(h/2)})"><rect x="${f1(-w*.1)}" y="${f1(h*.46)}" width="${f1(w*1.2)}" height="${f1(h*.07)}" fill="${P[2]}"/><rect x="${f1(w*.1)}" y="${f1(h*.62)}" width="${f1(w*.5)}" height="${f1(h*.03)}" fill="${P[2]}"/><rect x="${f1(w*.4)}" y="${f1(h*.3)}" width="${f1(w*.45)}" height="${f1(h*.04)}" fill="${P[3]}"/></g>`;return s},
mondrian(w,h,P,r){let s="";const lw=Math.max(2,Math.min(w,h)*.035);const split=(x,y,cw,ch,d)=>{if(d===0||cw<w*.18||ch<h*.18){const k=r();const fill=k<.16?P[1]:k<.28?P[2]:k<.38?P[3]:P[0];s+=`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ch)}" fill="${fill}" stroke="${P[4]}" stroke-width="${f1(lw)}"/>`;return}
  if(cw/w>ch/h){const t=.3+r()*.4;split(x,y,cw*t,ch,d-1);split(x+cw*t,y,cw*(1-t),ch,d-1)}else{const t=.3+r()*.4;split(x,y,cw,ch*t,d-1);split(x,y+ch*t,cw,ch*(1-t),d-1)}};split(0,0,w,h,5);return s},
shapes(w,h,P,r){const m=Math.min(w,h);let s=BG(P[0],w,h);s+=`<circle cx="${f1(w*.32)}" cy="${f1(h*.44)}" r="${f1(m*.3)}" fill="${P[1]}"/>`;
  s+=`<path d="M${f1(w*.58)},${f1(h*.86)} L${f1(w*.78)},${f1(h*.14)} L${f1(w*.95)},${f1(h*.86)}Z" fill="${P[3]}"/>`;
  s+=`<rect x="${f1(w*.46)}" y="${f1(h*.5)}" width="${f1(m*.26)}" height="${f1(m*.26)}" fill="${P[2]}"/>`;
  s+=`<rect x="${f1(w*.05)}" y="${f1(h*.82)}" width="${f1(w*.5)}" height="${f1(h*.06)}" fill="${P[4]}"/><line x1="${f1(w*.1)}" y1="${f1(h*.08)}" x2="${f1(w*.9)}" y2="${f1(h*.08)}" stroke="${P[4]}" stroke-width="1.5"/>`;return s},
sunburst(w,h,P,r){let s=BG(P[0],w,h);const ox=w/2,oy=h*1.02,R=Math.max(w,h)*1.5,n=22;for(let i=0;i<n;i+=2){const a1=Math.PI+Math.PI*i/n,a2=Math.PI+Math.PI*(i+1)/n;s+=`<path d="M${f1(ox)},${f1(oy)} L${f1(ox+Math.cos(a1)*R)},${f1(oy+Math.sin(a1)*R)} L${f1(ox+Math.cos(a2)*R)},${f1(oy+Math.sin(a2)*R)}Z" fill="${P[1]}" opacity=".9"/>`}
  [.62,.46,.3].forEach((k,j)=>{const rr=h*k;s+=`<path d="M${f1(ox-rr)},${f1(oy)} A${f1(rr)},${f1(rr)} 0 0 1 ${f1(ox+rr)},${f1(oy)}Z" fill="${j%2?P[2]:P[0]}" stroke="${P[3]}" stroke-width="1.2"/>`});
  s+=`<path d="M${f1(ox-h*.16)},${f1(oy)} A${f1(h*.16)},${f1(h*.16)} 0 0 1 ${f1(ox+h*.16)},${f1(oy)}Z" fill="${P[1]}"/>`;return s},
fringe(w,h,P,r){let s=BG(P[0],w,h);const ox=w/2,oy=h*.3,n=12;for(let i=0;i<n;i++){const a=Math.PI+Math.PI*(i+.5)/n;s+=`<line x1="${f1(ox)}" y1="${f1(oy)}" x2="${f1(ox+Math.cos(a)*h*.26)}" y2="${f1(oy+Math.sin(a)*h*.26)}" stroke="${P[1]}" stroke-width="1.6"/>`}
  s+=`<path d="M${f1(ox-h*.08)},${f1(oy)} A${f1(h*.08)},${f1(h*.08)} 0 0 1 ${f1(ox+h*.08)},${f1(oy)}Z" fill="${P[3]}"/><rect x="0" y="${f1(oy)}" width="${w}" height="${f1(h*.04)}" fill="${P[1]}"/>`;
  for(let x=3;x<w;x+=5){const len=h*(.45+.15*Math.sin(x/9));s+=`<line x1="${f1(x)}" y1="${f1(oy+h*.04)}" x2="${f1(x)}" y2="${f1(oy+len)}" stroke="${P[1]}" stroke-width="1" opacity=".85"/>`;for(let y=oy+h*.1;y<oy+len;y+=h*.11)s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="1.1" fill="${P[2]}"/>`}return s},
horizon(w,h,P,r){const g=uid();let s=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[1]}"/><stop offset="1" stop-color="${P[0]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>`;
  s+=`<rect y="${f1(h*.7)}" width="${w}" height="${f1(h*.3)}" fill="${P[2]}"/><ellipse cx="${f1(w*.62)}" cy="${f1(h*.82)}" rx="${f1(w*.32)}" ry="${f1(h*.025)}" fill="${P[4]}" opacity=".35"/>`;
  s+=`<circle cx="${f1(w*.36)}" cy="${f1(h*.42)}" r="${f1(Math.min(w,h)*.13)}" fill="${P[3]}"/><path d="M${f1(w*.6)},${f1(h*.5)} q${f1(w*.12)},${f1(h*.02)} ${f1(w*.16)},${f1(h*.12)} q${f1(w*.01)},${f1(h*.1)} ${f1(-w*.02)},${f1(h*.16)}" fill="none" stroke="${P[4]}" stroke-width="2"/>`;
  s+=`<ellipse cx="${f1(w*.75)}" cy="${f1(h*.2)}" rx="${f1(w*.12)}" ry="${f1(h*.06)}" fill="#fff" opacity=".85"/><ellipse cx="${f1(w*.68)}" cy="${f1(h*.22)}" rx="${f1(w*.08)}" ry="${f1(h*.05)}" fill="#fff" opacity=".85"/>`;return s},
grid(w,h,P,r){let s=BG(P[0],w,h);const x0=w*.14,x1=w*.86,y0=h*.08;s+=`<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1-x0)}" height="${f1(h-y0)}" fill="${P[1]}"/>`;
  const cols=Math.max(5,Math.round((x1-x0)/8)),rows=Math.max(6,Math.round((h-y0)/7));for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)if(r()<.22)s+=`<rect x="${f1(x0+j*(x1-x0)/cols)}" y="${f1(y0+i*(h-y0)/rows)}" width="${f1((x1-x0)/cols)}" height="${f1((h-y0)/rows)}" fill="${P[3]}" opacity=".55"/>`;
  for(let j=1;j<cols;j++)s+=`<line x1="${f1(x0+j*(x1-x0)/cols)}" y1="${f1(y0)}" x2="${f1(x0+j*(x1-x0)/cols)}" y2="${h}" stroke="${P[2]}" stroke-width=".7"/>`;
  for(let i=1;i<rows;i++)s+=`<line x1="${f1(x0)}" y1="${f1(y0+i*(h-y0)/rows)}" x2="${f1(x1)}" y2="${f1(y0+i*(h-y0)/rows)}" stroke="${P[2]}" stroke-width=".7"/>`;
  s+=`<rect x="${f1(x0)}" y="${f1(h*.88)}" width="${f1(x1-x0)}" height="${f1(h*.12)}" fill="${P[0]}"/>`;for(let j=0;j<6;j++)s+=`<rect x="${f1(x0+(j+.4)*(x1-x0)/6)}" y="${f1(h*.88)}" width="1.6" height="${f1(h*.12)}" fill="${P[1]}"/>`;s+=`<rect x="${f1(x1-6)}" y="${f1(y0)}" width="6" height="${f1(h*.05)}" fill="${P[4]}"/>`;return s},
wood(w,h,P,r){let s=BG(P[0],w,h);const by=h*.6;s+=`<rect y="${f1(by)}" width="${w}" height="${f1(h-by)}" fill="${P[1]}"/>`;
  for(let y=by+3;y<h;y+=3.2){let d=`M0,${f1(y)}`;for(let x=0;x<=w;x+=w/6)d+=` Q${f1(x+w/12)},${f1(y+(r()-.5)*3)} ${f1(x+w/6)},${f1(y)}`;s+=`<path d="${d}" fill="none" stroke="${P[2]}" stroke-width=".7" opacity=".7"/>`}
  s+=`<rect x="${f1(w*.12)}" y="${f1(by-h*.22)}" width="${f1(w*.34)}" height="${f1(h*.22)}" rx="${f1(h*.03)}" fill="${P[3]}"/><rect x="${f1(w*.6)}" y="${f1(by-h*.34)}" width="${f1(w*.04)}" height="${f1(h*.34)}" fill="${P[2]}"/><path d="M${f1(w*.54)},${f1(by-h*.34)} L${f1(w*.7)},${f1(by-h*.34)} L${f1(w*.66)},${f1(by-h*.48)} L${f1(w*.58)},${f1(by-h*.48)}Z" fill="${P[4]}"/>`;
  s+=`<circle cx="${f1(w*.82)}" cy="${f1(h*.24)}" r="${f1(Math.min(w,h)*.08)}" fill="${P[4]}" stroke="${P[2]}" stroke-width=".8"/>`;return s},
hourglass(w,h,P,r){let s=BG(P[0],w,h);for(let y=4;y<h;y+=9)for(let x=(y/9|0)%2?4:8.5;x<w;x+=9)s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="1.3" fill="${P[2]}"/>`;
  const n=Math.max(1,Math.round(w/(h*.8))),k=h/100;for(let i=0;i<n;i++){const cx=w*(i+.5)/n;s+=`<path d="M${f1(cx-13*k)},${f1(10*k)} L${f1(cx+13*k)},${f1(10*k)} L${f1(cx+5*k)},${f1(40*k)} Q${f1(cx+30*k)},${f1(60*k)} ${f1(cx+34*k)},${f1(95*k)} L${f1(cx-34*k)},${f1(95*k)} Q${f1(cx-30*k)},${f1(60*k)} ${f1(cx-5*k)},${f1(40*k)}Z" fill="${P[1]}"/><rect x="${f1(cx-6*k)}" y="${f1(38*k)}" width="${f1(12*k)}" height="${f1(4*k)}" fill="${P[3]}"/>`}return s},
boomerang(w,h,P,r){let s=BG(P[0],w,h);const n=Math.round(w*h/1500)+2;for(let k=0;k<n;k++){const x=r()*w,y=r()*h,sz=8+r()*12,a=r()*360,c=P[1+Math.floor(r()*3)];s+=`<path transform="translate(${f1(x)},${f1(y)}) rotate(${f1(a)}) scale(${f1(sz/10)})" d="M-10,4 Q0,-12 10,4 Q0,-4 -10,4Z" fill="${c}"/>`}
  for(let k=0;k<Math.max(2,n/3);k++){const x=r()*w,y=r()*h,R=5+r()*6;for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=`<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x+Math.cos(a)*R)}" y2="${f1(y+Math.sin(a)*R)}" stroke="${P[4]}" stroke-width=".9"/><circle cx="${f1(x+Math.cos(a)*R)}" cy="${f1(y+Math.sin(a)*R)}" r="1" fill="${P[4]}"/>`}}return s},
concrete(w,h,P,r){let s=BG(P[3],w,h);let y=h*.12;while(y<h){const bh=h*(.12+r()*.1);let x=-r()*20;while(x<w){const bw=w*(.18+r()*.25),c=P[Math.floor(r()*3)];s+=`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(bw-2)}" height="${f1(bh-2)}" fill="${c}"/><rect x="${f1(x+bw*.15)}" y="${f1(y+bh*.55)}" width="${f1(bw*.6)}" height="${f1(bh*.18)}" fill="${P[4]}"/>`;for(let l=x+3;l<x+bw-3;l+=3.5)s+=`<line x1="${f1(l)}" y1="${f1(y)}" x2="${f1(l)}" y2="${f1(y+bh*.5)}" stroke="${P[4]}" stroke-width=".25" opacity=".4"/>`;x+=bw}y+=bh}return s},
swiss(w,h,P,r){let s=BG(P[0],w,h);for(let i=1;i<6;i++)s+=`<line x1="${f1(w*i/6)}" y1="0" x2="${f1(w*i/6)}" y2="${h}" stroke="${P[3]}" stroke-width=".6"/>`;
  s+=`<circle cx="${f1(w*.66)}" cy="${f1(h*.48)}" r="${f1(Math.min(w,h)*.36)}" fill="${P[1]}"/>`;[[.12,.3,.32],[.12,.38,.22],[.12,.46,.27]].forEach(([x,y,l])=>s+=`<rect x="${f1(w*x)}" y="${f1(h*y)}" width="${f1(w*l)}" height="${f1(Math.max(2,h*.035))}" fill="${P[2]}"/>`);
  s+=`<rect x="${f1(w*.12)}" y="${f1(h*.76)}" width="${f1(w*.12)}" height="${f1(w*.12)}" fill="${P[2]}"/>`;return s},
halftone(w,h,P,r){let s=BG(P[0],w,h);for(let y=4;y<h;y+=7)for(let x=(y/7|0)%2?4:7.5;x<w;x+=7){const t=(x/w+y/h)/2;s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.6+2.6*t)}" fill="${P[1]}"/>`}
  const cx=w*.5,cy=h*.5,R=Math.min(w,h)*.34;let d="";for(let i=0;i<24;i++){const a=i*Math.PI/12,rr=i%2?R*.6:R;d+=(i?"L":"M")+f1(cx+Math.cos(a)*rr*(w>h*1.3?1.5:1))+","+f1(cy+Math.sin(a)*rr)}
  s+=`<path d="${d}Z" fill="${P[4]}" stroke="${P[3]}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R*.32)}" fill="${P[2]}" stroke="${P[3]}" stroke-width="2"/>`;return s},
op(w,h,P,r){let s=BG(P[0],w,h);const cx=w*.42,cy=h*.55,M2=Math.hypot(w,h);for(let R=M2;R>2;R-=5){s+=`<ellipse cx="${f1(cx+(M2-R)*.08)}" cy="${f1(cy)}" rx="${f1(R)}" ry="${f1(R*.92)}" fill="${(Math.round(R/5)%2)?P[1]:P[0]}"/>`}return s},
roundel(w,h,P,r){let s=BG(P[0],w,h);for(let x=0;x<w*.4;x+=6)s+=`<rect x="${f1(x)}" width="3" height="${h}" fill="${P[1]}"/>`;const n=Math.max(1,Math.round(w/h)),m=Math.min(w/n,h);for(let i=0;i<n;i++){const cx=w*.4+(w*.6)*(i+.5)/n,cy=h/2;s+=`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(m*.4)}" fill="${P[3]}"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(m*.27)}" fill="${P[0]}"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(m*.14)}" fill="${P[2]}"/>`}
  s+=`<rect x="${f1(w*.4-1)}" y="0" width="2" height="${h}" fill="${P[4]}"/>`;return s},
psych(w,h,P,r){let s=BG(P[0],w,h);const cx=w*.5,cy=h*.55,M2=Math.hypot(w,h)*.7;let i=0;for(let R=M2;R>3;R-=M2/14,i++){let d="";for(let k=0;k<=72;k++){const a=k/72*Math.PI*2,rr=R+Math.sin(a*7+i)*R*.09;d+=(k?"L":"M")+f1(cx+Math.cos(a)*rr*1.3)+","+f1(cy+Math.sin(a)*rr)}s+=`<path d="${d}Z" fill="${P[1+i%4]}"/>`}return s},
void(w,h,P,r){let s=BG(P[0],w,h);s+=`<line x1="${f1(w*.18)}" y1="${f1(h*.618)}" x2="${f1(w*.82)}" y2="${f1(h*.618)}" stroke="${P[1]}" stroke-width=".9"/><rect x="${f1(w*.6)}" y="${f1(h*.618-Math.min(w,h)*.14)}" width="${f1(Math.min(w,h)*.14)}" height="${f1(Math.min(w,h)*.14)}" fill="${P[2]}"/><rect x="${f1(w*.6+Math.min(w,h)*.14)}" y="${f1(h*.618-Math.min(w,h)*.06)}" width="${f1(Math.min(w,h)*.06)}" height="${f1(Math.min(w,h)*.06)}" fill="${P[3]}"/>`;return s},
ransom(w,h,P,r){let s=BG(P[0],w,h);const txt="DOITYOURSELF",fam=["Georgia,serif","Arial Black,Arial,sans-serif","Courier New,monospace","Impact,sans-serif"];const sz=Math.min(h*.36,22);let x=4,y=sz+4,i=0;
  while(y<h+sz*.3){const ch=txt[i%txt.length],c=1+Math.floor(r()*4),bw=sz*.82,rot=(r()-.5)*16;s+=`<g transform="translate(${f1(x+bw/2)},${f1(y-sz*.35)}) rotate(${f1(rot)})"><rect x="${f1(-bw/2)}" y="${f1(-sz*.55)}" width="${f1(bw)}" height="${f1(sz*1.1)}" fill="${P[c]}"/><text x="0" y="${f1(sz*.33)}" font-size="${f1(sz*.85)}" font-family="${fam[i%4]}" text-anchor="middle" font-weight="700" fill="${c===1?P[0]:P[1]}">${ch}</text></g>`;x+=bw+2;i++;if(x>w-bw*.5){x=4+r()*6;y+=sz*1.25}}
  s+=`<line x1="${f1(w*.1)}" y1="${f1(h*.9)}" x2="${f1(w*.5)}" y2="${f1(h*.7)}" stroke="${P[1]}" stroke-width="1.6"/><circle cx="${f1(w*.1)}" cy="${f1(h*.9)}" r="2.5" fill="none" stroke="${P[1]}" stroke-width="1.2"/>`;return s},
postmo(w,h,P,r){let s=BG(P[0],w,h);const x0=w*.2,x1=w*.8;s+=`<rect x="${f1(x0)}" y="${f1(h*.36)}" width="${f1(x1-x0)}" height="${f1(h*.64)}" fill="${P[1]}"/>`;
  s+=`<path d="M${f1(x0-4)},${f1(h*.36)} L${f1(w*.47)},${f1(h*.1)} L${f1(w*.47)},${f1(h*.36)}Z M${f1(w*.53)},${f1(h*.36)} L${f1(w*.53)},${f1(h*.1)} L${f1(x1+4)},${f1(h*.36)}Z" fill="${P[2]}"/>`;
  s+=`<circle cx="${f1(w/2)}" cy="${f1(h*.27)}" r="${f1(h*.07)}" fill="${P[3]}"/><rect x="${f1(w*.28)}" y="${f1(h*.5)}" width="${f1(w*.08)}" height="${f1(h*.5)}" fill="${P[2]}"/><rect x="${f1(w*.64)}" y="${f1(h*.5)}" width="${f1(w*.08)}" height="${f1(h*.5)}" fill="${P[2]}"/><rect x="${f1(w*.42)}" y="${f1(h*.62)}" width="${f1(w*.16)}" height="${f1(h*.38)}" fill="${P[4]}"/><rect x="${f1(x0)}" y="${f1(h*.44)}" width="${f1(x1-x0)}" height="${f1(h*.03)}" fill="${P[3]}"/>`;return s},
confetti(w,h,P,r){let s=BG(P[0],w,h);for(let y=3;y<h;y+=8)for(let x=3;x<w;x+=8)if(r()<.5)s+=`<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x+2+r()*3)}" y2="${f1(y+(r()-.5)*4)}" stroke="${P[4]}" stroke-width=".9"/>`;
  const n=Math.round(w*h/900)+3;for(let k=0;k<n;k++){const x=r()*w,y=r()*h,t=r();if(t<.35){let d=`M${f1(x)},${f1(y)}`;for(let i=1;i<6;i++)d+=` L${f1(x+i*4)},${f1(y+(i%2?-4:4))}`;s+=`<path d="${d}" fill="none" stroke="${P[1]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`}
  else if(t<.65)s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(3+r()*5)}" fill="${P[2]}"/>`;else s+=`<path d="M${f1(x)},${f1(y)} l10,0 l-5,-9Z" fill="${P[3]}" transform="rotate(${f1(r()*360)} ${f1(x)} ${f1(y)})"/>`}return s},
lace(w,h,P,r){let s=BG(P[0],w,h);const g=14;for(let y=0;y<h+g;y+=g)for(let x=(y/g|0)%2?g/2:0;x<w+g;x+=g){s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(g*.5)}" fill="none" stroke="${P[1]}" stroke-width=".7"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(g*.18)}" fill="none" stroke="${P[3]}" stroke-width=".6" opacity=".7"/>`}
  const cx=w*.5,cy=h*.52,R=Math.min(w,h)*.2;s+=`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R*1.15)}" fill="${P[0]}"/>`;for(let i=0;i<3;i++)s+=`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R*(1-i*.3))}" fill="${i%2?P[4]:P[2]}"/>`;s+=`<path d="M${f1(cx-R*.5)},${f1(cy)} q${f1(R*.5)},${f1(-R*.6)} ${f1(R)},0" fill="none" stroke="${P[0]}" stroke-width="1"/>`;return s},
neon(w,h,P,r){let s=BG(P[0],w,h);for(let i=0;i<w;i+=7)s+=`<line x1="${f1(i)}" y1="0" x2="${f1(i-12)}" y2="${h}" stroke="${P[3]}" stroke-width=".4" opacity=".18"/>`;
  let x=0;while(x<w){const bw=w*(.08+r()*.12),bh=h*(.35+r()*.55);s+=`<rect x="${f1(x)}" y="${f1(h-bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="${P[1]}"/>`;for(let y=h-bh+4;y<h;y+=5)for(let wx=x+2;wx<x+bw-2;wx+=4)if(r()<.25)s+=`<rect x="${f1(wx)}" y="${f1(y)}" width="1.6" height="2" fill="${P[4]}" opacity=".8"/>`;x+=bw+1}
  const ny=h*.32;s+=`<line x1="0" y1="${f1(ny)}" x2="${w}" y2="${f1(ny)}" stroke="${P[2]}" stroke-width="5" opacity=".3"/><line x1="0" y1="${f1(ny)}" x2="${w}" y2="${f1(ny)}" stroke="${P[2]}" stroke-width="1.6"/>`;
  s+=`<rect x="${f1(w*.66)}" y="${f1(h*.4)}" width="${f1(w*.08)}" height="${f1(h*.3)}" fill="none" stroke="${P[3]}" stroke-width="4" opacity=".3"/><rect x="${f1(w*.66)}" y="${f1(h*.4)}" width="${f1(w*.08)}" height="${f1(h*.3)}" fill="none" stroke="${P[3]}" stroke-width="1.4"/>`;return s},
shards(w,h,P,r){let s=BG(P[0],w,h);for(let k=0;k<11;k++){const cx=r()*w,cy=r()*h,R=Math.min(w,h)*(.15+r()*.3);let d="";const n=3+Math.floor(r()*2),a0=r()*6;for(let i=0;i<n;i++){const a=a0+i*(Math.PI*2/n)+(r()-.5);d+=(i?"L":"M")+f1(cx+Math.cos(a)*R*(1+(r()-.5)*.8))+","+f1(cy+Math.sin(a)*R*.7)}s+=`<path d="${d}Z" fill="${P[1+k%3]}" opacity=".88" stroke="${P[4]}" stroke-width=".8"/>`}
  for(let k=0;k<3;k++)s+=`<line x1="${f1(r()*w)}" y1="0" x2="${f1(r()*w)}" y2="${h}" stroke="${P[3]}" stroke-width="1.2"/>`;return s},
brick(w,h,P,r){let s=BG(P[4],w,h);const bh=8,bw=18;for(let y=0,row=0;y<h;y+=bh,row++)for(let x=row%2?-bw/2:0;x<w;x+=bw)s+=`<rect x="${f1(x+1)}" y="${f1(y+1)}" width="${bw-2}" height="${bh-2}" fill="${r()<.5?P[1]:P[2]}" opacity="${f1(.82+r()*.18)}"/>`;
  s+=`<path d="M0,${f1(h*.24)} L${f1(w*.7)},${f1(h*.24)} Q${f1(w*.76)},${f1(h*.24)} ${f1(w*.76)},${f1(h*.32)} L${f1(w*.76)},${h}" fill="none" stroke="${P[3]}" stroke-width="${f1(Math.min(w,h)*.08)}"/><line x1="${f1(w*.32)}" y1="0" x2="${f1(w*.32)}" y2="${f1(h*.55)}" stroke="${P[3]}" stroke-width="1"/><circle cx="${f1(w*.32)}" cy="${f1(h*.6)}" r="${f1(Math.min(w,h)*.06)}" fill="#f6d27a" stroke="${P[3]}" stroke-width=".8"/>`;return s},
plaid(w,h,P,r){let s=BG(P[0],w,h);for(let x=-4;x<w;x+=24)s+=`<rect x="${f1(x)}" y="0" width="10" height="${h}" fill="${P[1]}" opacity=".55"/><rect x="${f1(x+15)}" y="0" width="2" height="${h}" fill="${P[2]}" opacity=".8"/><rect x="${f1(x+20)}" y="0" width="1" height="${h}" fill="${P[4]}" opacity=".6"/>`;
  for(let y=-4;y<h;y+=24)s+=`<rect x="0" y="${f1(y)}" width="${w}" height="10" fill="${P[1]}" opacity=".55"/><rect x="0" y="${f1(y+15)}" width="${w}" height="2" fill="${P[3]}" opacity=".8"/><rect x="0" y="${f1(y+20)}" width="${w}" height="1" fill="${P[4]}" opacity=".6"/>`;return s},
herringbone(w,h,P,r){let s=BG(P[0],w,h);for(let x=0,c=0;x<w+8;x+=8,c++){let d=`M${f1(x)},0`;for(let y=0;y<=h+6;y+=6)d+=` L${f1(x+((y/6)%2?4:0))},${f1(y)}`;s+=`<path d="${d}" fill="none" stroke="${c%2?P[1]:P[2]}" stroke-width="3.2" opacity=".9"/>`}
  s+=`<rect x="${f1(w*.62)}" y="${f1(h*.2)}" width="${f1(w*.12)}" height="${f1(h*.6)}" fill="${P[3]}"/><rect x="${f1(w*.75)}" y="${f1(h*.26)}" width="${f1(w*.1)}" height="${f1(h*.54)}" fill="${P[4]}"/><rect x="${f1(w*.62)}" y="${f1(h*.3)}" width="${f1(w*.12)}" height="2" fill="${P[4]}"/>`;return s},
chrome(w,h,P,r){const g=uid(),m=uid();let s=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[4]}"/></linearGradient><linearGradient id="${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="${P[2]}"/><stop offset=".55" stop-color="#5d6a86"/><stop offset="1" stop-color="#f2f5fb"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>`;
  for(let k=0;k<4;k++){const cx=r()*w,cy=r()*h,R=Math.min(w,h)*(.14+r()*.16);s+=`<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R*1.2)}" ry="${f1(R)}" fill="url(#${m})"/><ellipse cx="${f1(cx-R*.3)}" cy="${f1(cy-R*.45)}" rx="${f1(R*.4)}" ry="${f1(R*.15)}" fill="#fff" opacity=".8"/>`}
  for(let k=0;k<5;k++){const x=r()*w,y=r()*h,R=3+r()*4;s+=`<path d="M${f1(x)},${f1(y-R)} Q${f1(x)},${f1(y)} ${f1(x+R)},${f1(y)} Q${f1(x)},${f1(y)} ${f1(x)},${f1(y+R)} Q${f1(x)},${f1(y)} ${f1(x-R)},${f1(y)} Q${f1(x)},${f1(y)} ${f1(x)},${f1(y-R)}Z" fill="${k%2?P[3]:"#ffffff"}"/>`}return s},
aero(w,h,P,r){const g=uid();let s=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[3]}"/><stop offset=".6" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>`;
  s+=`<ellipse cx="${f1(w*.3)}" cy="${f1(h*1.05)}" rx="${f1(w*.7)}" ry="${f1(h*.3)}" fill="${P[2]}"/><ellipse cx="${f1(w*.3)}" cy="${f1(h*1.02)}" rx="${f1(w*.5)}" ry="${f1(h*.14)}" fill="#a8e07a" opacity=".5"/>`;
  for(let k=0;k<7;k++){const x=r()*w,y=r()*h*.75,R=3+r()*Math.min(w,h)*.12;s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="#ffffff" fill-opacity=".14" stroke="#ffffff" stroke-opacity=".75" stroke-width=".9"/><ellipse cx="${f1(x-R*.35)}" cy="${f1(y-R*.45)}" rx="${f1(R*.35)}" ry="${f1(R*.18)}" fill="#fff" opacity=".85"/>`}return s},
vapor(w,h,P,r){const g=uid(),sg=uid();const hz=h*.62;let s=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[4]}"/></linearGradient><linearGradient id="${sg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[2]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>`;
  const R=Math.min(w,h)*.3;s+=`<circle cx="${f1(w/2)}" cy="${f1(hz-R*.25)}" r="${f1(R)}" fill="url(#${sg})"/>`;for(let i=0;i<5;i++)s+=`<rect x="0" y="${f1(hz-R*.55+i*R*.17)}" width="${w}" height="${f1(1+i*.8)}" fill="${P[4]}"/>`;
  s+=`<rect y="${f1(hz)}" width="${w}" height="${f1(h-hz)}" fill="${P[0]}"/>`;for(let i=-10;i<=10;i++)s+=`<line x1="${f1(w/2+i*4)}" y1="${f1(hz)}" x2="${f1(w/2+i*w*.14)}" y2="${h}" stroke="${P[3]}" stroke-width=".8"/>`;
  for(let k=1;k<7;k++){const y=hz+(h-hz)*Math.pow(k/7,1.8);s+=`<line x1="0" y1="${f1(y)}" x2="${w}" y2="${f1(y)}" stroke="${P[3]}" stroke-width=".8"/>`}return s},
skeuo(w,h,P,r){const g=uid();let s=BG(P[0],w,h);for(let k=0;k<w*h/12;k++)s+=`<circle cx="${f1(r()*w)}" cy="${f1(r()*h)}" r=".5" fill="${P[4]}" opacity=".5"/>`;
  s+=`<rect x="4" y="4" width="${w-8}" height="${h-8}" rx="4" fill="none" stroke="${P[1]}" stroke-width="1" stroke-dasharray="3 2.5"/>`;
  const bw=Math.min(w*.6,140),bh=Math.min(h*.3,30);s+=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[2]}"/><stop offset="1" stop-color="${P[3]}"/></linearGradient></defs><rect x="${f1(w/2-bw/2)}" y="${f1(h/2-bh/2+2)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(bh/2)}" fill="#000" opacity=".35"/><rect x="${f1(w/2-bw/2)}" y="${f1(h/2-bh/2)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(bh/2)}" fill="url(#${g})" stroke="${P[4]}" stroke-width=".8"/><rect x="${f1(w/2-bw/2+3)}" y="${f1(h/2-bh/2+2)}" width="${f1(bw-6)}" height="${f1(bh*.42)}" rx="${f1(bh*.21)}" fill="#fff" opacity=".45"/>`;return s},
flow(w,h,P,r){let s=BG(P[0],w,h);const n=Math.max(16,Math.round(h/4));for(let i=0;i<n;i++){const y=(i+.5)*h/n,a=h*.18*Math.sin(i*.35);s+=`<path d="M0,${f1(y)} C${f1(w*.3)},${f1(y-a*2)} ${f1(w*.55)},${f1(y+a*2.4)} ${w},${f1(y-a*.6)}" fill="none" stroke="${i%4?P[1]:P[3]}" stroke-width="${f1(.6+.8*Math.abs(Math.sin(i*.4)))}"/>`}return s},
flat(w,h,P,r){let s=BG(P[0],w,h);const sz=Math.min(h*.32,22),gap=sz*.4;let i=0;for(let y=gap;y+sz<=h;y+=sz+gap)for(let x=gap;x+sz<=w;x+=sz+gap,i++){const c=P[1+i%4];s+=`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(sz)}" height="${f1(sz)}" rx="${f1(sz*.22)}" fill="${c}"/>`;s+=i%3?`<circle cx="${f1(x+sz/2)}" cy="${f1(y+sz/2)}" r="${f1(sz*.2)}" fill="#fff"/>`:`<rect x="${f1(x+sz*.28)}" y="${f1(y+sz*.3)}" width="${f1(sz*.44)}" height="${f1(sz*.4)}" fill="#fff"/>`}return s},
utility(w,h,P,r){let s=BG(P[0],w,h);s+=`<g transform="rotate(-24 ${f1(w/2)} ${f1(h/2)})">`;[.3,.62].forEach((t,j)=>{const y=h*t;s+=`<rect x="${f1(-w*.2)}" y="${f1(y)}" width="${f1(w*1.4)}" height="${f1(h*.14)}" fill="${P[1]}"/><line x1="${f1(-w*.2)}" y1="${f1(y+2)}" x2="${f1(w*1.2)}" y2="${f1(y+2)}" stroke="${P[2]}" stroke-width=".7" stroke-dasharray="2 2"/><line x1="${f1(-w*.2)}" y1="${f1(y+h*.14-2)}" x2="${f1(w*1.2)}" y2="${f1(y+h*.14-2)}" stroke="${P[2]}" stroke-width=".7" stroke-dasharray="2 2"/><rect x="${f1(w*(.3+j*.25))}" y="${f1(y-h*.03)}" width="${f1(h*.18)}" height="${f1(h*.2)}" rx="2" fill="none" stroke="${P[4]}" stroke-width="2"/>`});
  s+=`</g><rect x="${f1(w*.08)}" y="${f1(h*.08)}" width="${f1(w*.16)}" height="${f1(h*.08)}" fill="${P[3]}"/><line x1="0" y1="${f1(h*.92)}" x2="${w}" y2="${f1(h*.92)}" stroke="${P[4]}" stroke-width="1.4" opacity=".7"/>`;return s},
enso(w,h,P,r){let s=BG(P[0],w,h);for(let k=0;k<w*h/40;k++)s+=`<circle cx="${f1(r()*w)}" cy="${f1(r()*h)}" r="${f1(.3+r()*.7)}" fill="${P[2]}" opacity=".35"/>`;
  const cx=w/2,cy=h/2,R=Math.min(w,h)*.32,a0=-1.2,a1=a0+Math.PI*1.82;const pt=a=>f1(cx+Math.cos(a)*R)+","+f1(cy+Math.sin(a)*R);
  s+=`<path d="M${pt(a0)} A${f1(R)},${f1(R)} 0 1 1 ${pt(a1)}" fill="none" stroke="${P[1]}" stroke-width="${f1(R*.22)}" stroke-linecap="round" opacity=".88"/><path d="M${pt(a0+.2)} A${f1(R*.97)},${f1(R*.97)} 0 1 1 ${pt(a1-.1)}" fill="none" stroke="${P[0]}" stroke-width="${f1(R*.025)}" opacity=".5"/>`;
  s+=`<path d="M${f1(w*.12)},${f1(h*.86)} l${f1(w*.1)},${f1(-h*.04)} l${f1(w*.06)},${f1(h*.03)}" fill="none" stroke="${P[4]}" stroke-width="1.6" stroke-linecap="round"/>`;return s},
gingham(w,h,P,r){let s=BG(P[0],w,h);for(let x=0;x<w;x+=14)s+=`<rect x="${f1(x)}" y="0" width="7" height="${h}" fill="${P[4]}" opacity=".5"/>`;for(let y=0;y<h;y+=14)s+=`<rect x="0" y="${f1(y)}" width="${w}" height="7" fill="${P[4]}" opacity=".5"/>`;
  const n=Math.round(w*h/700)+3;for(let k=0;k<n;k++){const x=r()*w,y=r()*h,R=2.2+r()*2.5;s+=`<ellipse cx="${f1(x+R*1.6)}" cy="${f1(y+R)}" rx="${f1(R*.9)}" ry="${f1(R*.4)}" fill="${P[2]}" transform="rotate(30 ${f1(x)} ${f1(y)})"/>`;for(let p=0;p<5;p++)s+=`<circle cx="${f1(x+Math.cos(p*1.256)*R*.8)}" cy="${f1(y+Math.sin(p*1.256)*R*.8)}" r="${f1(R*.6)}" fill="${P[1]}"/>`;s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R*.4)}" fill="${P[3]}"/>`}return s},
leaves(w,h,P,r){let s=BG(P[0],w,h);if(P[2]&&P[2].toLowerCase()==="#f2c14e")s+=`<circle cx="${f1(w*.78)}" cy="${f1(h*.24)}" r="${f1(Math.min(w,h)*.16)}" fill="${P[2]}"/>`;
  const n=Math.round(w*h/220)+6;for(let k=0;k<n;k++){const x=r()*w,y=r()*h,l=6+r()*11,a=r()*360,c=[P[1],P[1],P[3],P[2]][Math.floor(r()*4)];s+=`<path transform="translate(${f1(x)},${f1(y)}) rotate(${f1(a)})" d="M0,0 Q${f1(l*.5)},${f1(-l*.38)} ${f1(l)},0 Q${f1(l*.5)},${f1(l*.38)} 0,0Z" fill="${c}" opacity=".92"/>`}return s},
seigaiha(w,h,P,r){let s=BG(P[0],w,h);const R=11,dx=R*2,dy=R*.55;for(let y=-R,row=0;y<h+R*2;y+=dy,row++)for(let x=row%2?R:0;x<w+R;x+=dx){s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${R}" fill="${row%3===0?P[2]:P[1]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R*.72)}" fill="none" stroke="${P[0]}" stroke-width="1.1"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R*.42)}" fill="none" stroke="${P[0]}" stroke-width="1.1"/>`}
  s+=`<circle cx="${f1(w*.8)}" cy="${f1(h*.24)}" r="${f1(Math.min(w,h)*.14)}" fill="${P[3]}"/>`;return s}
};
function motif(st,w,h){return M[st.m](w,h,st.p,rng(hash(st.id)))}
function plateSVG(st,w,h,cls=""){return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${motif(st,w,h)}</svg>`}

/* INTERPRETATIONS: Claude's illustrated readings of each style, drawn in code */
const W=320,H=240,CX=160;
const F={black:'"UnifrakturMaguntia",serif',cinzel:'"Cinzel",Georgia,serif',limelight:'"Limelight",Georgia,serif',pacifico:'"Pacifico",cursive',righteous:'"Righteous",sans-serif',vt:'"VT323",monospace',orbitron:'"Orbitron",sans-serif',bangers:'"Bangers",Impact,sans-serif',smythe:'"Smythe",Georgia,serif',elite:'"Special Elite","Courier New",monospace',graduate:'"Graduate",Georgia,serif',dancing:'"Dancing Script",cursive',stencil:'"Allerta Stencil",sans-serif',helv:'"Helvetica Neue",Helvetica,Arial,sans-serif',black2:'"Arial Black","Helvetica Neue",Arial,sans-serif',fraunces:'"Fraunces",Georgia,serif',atk:'"Atkinson Hyperlegible",Arial,sans-serif'};
const FK={black:.5,cinzel:.78,limelight:.66,pacifico:.6,righteous:.62,vt:.48,orbitron:.86,bangers:.5,smythe:.48,elite:.62,graduate:.82,dancing:.48,stencil:.72,helv:.6,black2:.74,fraunces:.56,atk:.56};
const hex6=x=>x.length===4?"#"+[...x.slice(1)].map(c=>c+c).join(""):x;
function mix(a,b,t){a=hex6(a);b=hex6(b);const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=p(a),B=p(b);return"#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("")}
const lum=c=>{c=hex6(c);const p=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);return .2126*p[0]+.7152*p[1]+.0722*p[2]};
const rect=(x,y,w,h,f,e="")=>`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${f}" ${e}/>`;
const circ=(x,y,r,f,e="")=>`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${f}" ${e}/>`;
const path=(d,f,e="")=>`<path d="${d}" fill="${f}" ${e}/>`;
const line=(x1,y1,x2,y2,s,w=1,e="")=>`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${s}" stroke-width="${w}" ${e}/>`;
const txt=(x,y,t,size,fill,fam,e="")=>`<text x="${f1(x)}" y="${f1(y)}" font-size="${f1(size)}" fill="${fill}" font-family='${fam}' ${e}>${esc(t)}</text>`;
const stroke=(c,w,e="")=>`stroke="${c}" stroke-width="${w}" ${e}`;
function pat(st,size){const id=uid();return{id,def:`<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><svg width="${size}" height="${size}" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice">${motif(st,60,60)}</svg></pattern>`,url:`url(#${id})`}}
const fake=(m,p,id)=>({m,p,id:id||m});
const pw=(x,y,w,h,f,e="")=>path(`M${x},${y+h} V${y+w*.6} Q${x},${y} ${x+w/2},${y-w*.35} Q${x+w},${y} ${x+w},${y+w*.6} V${y+h}Z`,f,e);
const rw=(x,y,w,h,f,e="")=>path(`M${x},${y+h} V${y+w/2} A${w/2},${w/2} 0 0 1 ${x+w},${y+w/2} V${y+h}Z`,f,e);
function sky(P){const g=uid(),bot=mix(P[0],"#ffffff",lum(P[0])<.35?.1:.3);return`<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`+rect(0,0,W,H,`url(#${g})`)}
const ground=(P,c)=>rect(0,206,W,34,c||mix(P[0],"#000",.3));
const pickC=P=>{let b=P[1],d=0;P.slice(1).forEach(c=>{const x=Math.abs(lum(c)-lum(P[0]));if(x>d){d=x;b=c}});return b};

/* Buildings */
const BLD={
cathedral(st,v={}){const P=st.p;let s=sky(P);const stone=P[1],glass=P[2],acc=P[3],gold=P[4],dk=mix(stone,"#000",.45);
  for(const x of[40,280]){const d=x<160?1:-1;s+=path(`M${x},206 L${x},150 L${x+d*14},140 L${x+d*62},118`,"none",stroke(stone,5));s+=path(`M${x-4},150 L${x},136 L${x+4},150Z`,stone)}
  s+=rect(105,110,110,96,stone)+path("M105,110 L160,64 L215,110Z",stone);
  const tw=(x,clock)=>{let t=rect(x,60,42,146,stone);
    if(clock){t+=rect(x-4,26,50,44,stone)+circ(x+21,46,13,mix(stone,"#fff",.65))+line(x+21,46,x+21,37,acc,2)+line(x+21,46,x+28,49,acc,2)+path(`M${x-6},26 L${x+21},-6 L${x+48},26Z`,mix(stone,"#000",.25))}
    else t+=path(`M${x-2},60 L${x+21},4 L${x+44},60Z`,mix(stone,"#000",.2))+line(x+21,4,x+21,-8,gold,2);
    for(let i=0;i<3;i++)t+=pw(x+14,76+i*40,14,24,glass);return t};
  s+=tw(63,false)+tw(215,!!v.clock);
  s+=circ(160,108,20,glass,stroke(gold,2));for(let i=0;i<12;i++){const a=i*Math.PI/6;s+=line(160,108,160+Math.cos(a)*20,108+Math.sin(a)*20,gold,1.2)}s+=circ(160,108,6,acc);
  s+=pw(146,154,28,52,dk)+pw(118,170,18,36,dk)+pw(184,170,18,36,dk)+pw(111,130,10,20,acc)+pw(199,130,10,20,acc);
  return s+ground(P)},
dome(st){const P=st.p;let s=sky(P);const wall=P[1],dark=P[2],acc=P[3],lt=mix(wall,"#fff",.4);
  s+=path("M108,108 A52,58 0 0 1 212,108Z",mix(dark,"#a0522d",.35));for(let i=1;i<6;i++){const x=108+i*104/6;s+=path(`M${x},108 Q${f1(160+(x-160)*.55)},62 160,51`,"none",stroke(lt,1.6))}
  s+=rect(152,38,16,14,lt)+path("M150,38 L160,26 L170,38Z",dark)+rect(112,100,96,14,wall);
  s+=rect(46,114,228,92,wall)+rect(40,110,240,8,lt);
  for(let i=0;i<7;i++){const x=58+i*30;s+=rw(x,152,18,54,acc)+rect(x-7,118,4,88,lt)}
  s+=circ(160,132,8,acc)+line(46,142,274,142,mix(wall,"#000",.2),1);return s+ground(P,mix(P[0],"#000",.18))},
baroque(st){const P=st.p;let s=sky(P);const cream=P[3],gold=P[1],red=P[2],brown=P[4],sh=mix(cream,"#000",.14);
  s+=path("M118,96 A42,52 0 0 1 202,96Z",brown,stroke(gold,1.5))+rect(154,34,12,12,gold)+path("M152,34 L160,24 L168,34Z",gold);
  s+=rect(40,120,240,86,cream)+path("M112,206 L112,92 Q160,68 208,92 L208,206Z",cream);
  s+=path("M66,120 C88,120 96,104 112,100","none",stroke(gold,5,'stroke-linecap="round"'))+path("M254,120 C232,120 224,104 208,100","none",stroke(gold,5,'stroke-linecap="round"'));
  s+=circ(66,114,5,"none",stroke(gold,3))+circ(254,114,5,"none",stroke(gold,3));
  s+=path("M120,104 Q138,88 152,86","none",stroke(gold,4))+path("M200,104 Q182,88 168,86","none",stroke(gold,4))+circ(160,84,7,gold);
  for(const x of[118,130,190,202])s+=rect(x-3,108,6,98,sh);for(const x of[52,66,254,268])s+=rect(x-3,128,6,78,sh);
  s+=rw(146,152,28,54,red)+circ(160,124,11,red,stroke(gold,2));for(const x of[82,224])s+=rw(x,152,16,34,red);
  s+=rect(36,116,248,6,gold);for(const x of[48,272,112,208])s+=path(`M${x-4},${x===112||x===208?94:116} Q${x},${x===112||x===208?76:98} ${x+4},${x===112||x===208?94:116}Z`,gold);
  return s+ground(P,mix(brown,"#000",.3))},
temple(st){const P=st.p;let s=sky(P);const a=mix(P[1],"#fff",.3),sh=P[2],dk=P[3];
  s+=path("M58,96 L160,52 L262,96Z",a,stroke(sh,1.5))+path("M80,92 L160,58 L240,92Z",mix(a,"#000",.06));
  s+=rect(54,96,212,16,a)+line(54,104,266,104,sh,1);
  for(let i=0;i<6;i++){const x=72+i*35.2;s+=rect(x,112,14,74,a)+rect(x-3,110,20,5,sh)+rect(x-3,184,20,4,sh);for(let k=1;k<4;k++)s+=line(x+k*3.5,116,x+k*3.5,182,mix(a,"#000",.12),.7)}
  s+=rect(128,128,64,58,mix(dk,"#000",.2));for(let i=0;i<3;i++)s+=rect(46-i*8,188+i*6,228+i*16,6,mix(a,"#000",.05*i));return s+ground(P,mix(sh,"#000",.2))},
pomo(st){const P=st.p;let s=sky(P);
  s+=rect(70,70,180,136,P[1])+path("M62,70 L150,28 L150,70Z",P[2])+path("M170,70 L170,28 L258,70Z",P[2])+circ(160,50,14,P[3]);
  s+=rect(90,96,26,110,P[2])+rect(204,96,26,110,P[2])+path("M86,96 l17,-12 l17,12z",P[3])+path("M200,96 l17,-12 l17,12z",P[3]);
  s+=rect(136,124,48,82,P[4])+path("M136,124 A24,24 0 0 1 184,124Z",P[3])+rect(70,78,180,7,P[3]);
  for(let i=0;i<7;i++)s+=rect(133+i*8,92,4,22,P[4]);return s+ground(P,mix(P[0],"#000",.2))},
nouveau(st){const P=st.p;let s=sky(P);const wall=mix(P[0],P[2],.4),ln=P[4],glass=P[1],acc=P[3];
  s+=path("M70,206 L70,92 C90,60 120,90 140,60 C160,30 190,72 210,52 C230,40 250,80 250,96 L250,206Z",wall,stroke(ln,2));
  const hw=(x,y,w,h)=>path(`M${x},${y+h} V${y+w*.5} C${x},${y-w*.25} ${x+w},${y-w*.25} ${x+w},${y+w*.5} V${y+h}Z`,glass,stroke(ln,2));
  s+=hw(92,98,30,38)+hw(198,92,30,44)+hw(144,72,32,48)+hw(140,152,40,54);
  s+=path("M84,146 C96,134 110,158 124,142 C130,136 134,148 136,146","none",stroke(ln,2.5))+path("M186,146 C198,134 212,158 226,142 C230,138 234,146 236,146","none",stroke(ln,2.5))+line(84,146,136,146,ln,2)+line(186,146,236,146,ln,2);
  s+=path("M70,206 C58,170 84,150 72,120 C64,100 80,94 78,84","none",stroke(glass,2.5))+circ(78,82,4,acc)+circ(66,140,3.5,acc)+circ(160,62,5,acc);
  return s+ground(P,mix(ln,"#000",.1))},
planes(st){const P=st.p;let s=rect(0,0,W,H,mix(P[0],"#9ab",.25));const wh="#fbfaf6",bk=P[4],gl=mix(bk,"#456",.45);
  s+=rect(80,80,150,126,wh)+rect(66,120,90,10,"#c9c6bf")+rect(170,72,94,8,wh,stroke(bk,1));
  s+=rect(96,92,60,40,gl)+rect(176,92,40,90,gl)+rect(96,146,50,40,gl);
  s+=line(80,140,240,140,bk,3)+line(166,80,166,206,bk,3)+line(232,80,232,206,bk,4);
  s+=rect(236,96,8,70,P[3])+rect(150,146,10,60,P[1])+rect(56,126,34,5,P[2])+rect(250,140,30,6,bk)+line(252,140,252,206,bk,2)+rect(90,66,8,30,P[1]);
  return s+ground(P,"#7d8a6a")},
bauhaus(st){const P=st.p;let s=rect(0,0,W,H,mix(P[0],"#bcd",.35));const wh="#f5f3ee",gl=mix("#2a3a4a",P[2],.3),gl2=mix(gl,"#fff",.25);
  s+=rect(24,124,120,82,wh)+rect(24,150,120,13,gl)+rect(24,180,120,10,gl);
  s+=rect(130,60,156,146,gl);for(let x=134;x<286;x+=10)s+=line(x,60,x,206,gl2,.8);for(let y=70;y<206;y+=14)s+=line(130,y,286,y,gl2,.8);
  s+=rect(130,52,156,10,wh)+rect(130,196,156,10,wh);
  "BAUHAUS".split("").forEach((c,i)=>s+=txt(301,90+i*15,c,13,P[4],F.helv,'text-anchor="middle" font-weight="700"'));
  s+=rect(40,120,22,4,P[1])+rect(70,120,22,4,P[2])+rect(100,120,22,4,P[3]);return s+ground(P,"#8a8f84")},
tower(st){const P=st.p;let s=rect(0,0,W,H,P[0]);const gold=P[1],grn=P[2],cr=P[3];
  for(const a of[-.55,-.3,.35])s+=path(`M160,206 L${f1(160+Math.tan(a)*420)},-214 L${f1(160+Math.tan(a+.05)*420)},-214Z`,cr,'opacity=".07"');
  for(let i=0;i<9;i++){const x=i*38-6,h=40+((i*37)%50);s+=rect(x,206-h,32,h,mix(P[0],"#fff",.08))}
  [[100,120,220],[116,96,204],[128,74,192],[140,56,180]].forEach(([a,y,b])=>s+=rect(a,y,b-a,206-y,grn)+rect(a,y-3,b-a,3,gold));
  for(let x=106;x<216;x+=8)s+=line(x,124,x,206,gold,.8);
  for(let i=0;i<4;i++){const r=20-i*4.5;s+=path(`M${f1(160-r)},56 A${f1(r)},${f1(r*1.4)} 0 0 1 ${f1(160+r)},56`,"none",stroke(gold,2));for(const k of[-1,1])s+=path(`M${f1(160+k*r*.6)},${f1(56-r*.7)} l${-k*3},-6 l${k*3},2z`,cr)}
  s+=line(160,30,160,2,gold,2)+rect(146,178,28,28,mix(P[0],"#000",.3));for(let i=0;i<9;i++){const a=Math.PI+Math.PI*(i+.5)/9;s+=line(160,178,160+Math.cos(a)*18,178+Math.sin(a)*18,gold,1.2)}
  return s+ground(P,mix(P[0],"#000",.4))},
box(st){const P=st.p;let s=sky(P);
  s+=rect(216,20,70,186,P[1]);for(let y=26;y<206;y+=8)s+=line(216,y,286,y,mix(P[1],"#fff",.2),.6);for(let x=226;x<286;x+=10)s+=line(x,20,x,206,"#8a6a3a",.8);
  s+=rect(30,96,200,56,"#f7f7f5")+rect(30,116,200,14,P[1]);for(let x=40;x<230;x+=24)s+=line(x,152,x,206,P[1],2.5);
  s+=path("M90,96 C90,74 120,70 130,84 L150,84 L150,96Z","#f7f7f5")+rect(100,152,90,40,mix(P[2],"#fff",.3))+rect(232,198,8,8,P[4]);return s+ground(P,"#6f8a5f")},
ranch(st){const P=st.p;let s=sky(P);
  s+=circ(262,44,18,P[4])+path("M40,120 L160,138 L290,108 L290,116 L160,146 L40,128Z",P[3])+rect(56,132,226,74,"#f6efe0");
  s+=rect(120,144,120,62,mix(P[2],"#fff",.25));for(let x=150;x<240;x+=30)s+=line(x,144,x,206,P[3],2);s+=rect(130,170,40,22,P[4],'opacity=".75"');
  s+=rect(56,132,60,74,"#b7a38a");for(let y=138;y<206;y+=8)for(let x=58+((y/8|0)%2?6:0);x<112;x+=12)s+=rect(x,y,10,6,"#a08d74");
  s+=rect(248,150,22,56,P[1])+path("M30,206 Q34,150 26,110","none",stroke(P[3],4));
  for(let i=0;i<6;i++){const a=-Math.PI+i*Math.PI/5;s+=path(`M26,110 Q${f1(26+Math.cos(a)*16)},${f1(104+Math.sin(a)*16)} ${f1(26+Math.cos(a)*30)},${f1(116+Math.sin(a)*18)}`,"none",stroke(P[2],4,'stroke-linecap="round"'))}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=line(298,60,298+Math.cos(a)*10,60+Math.sin(a)*10,P[1],1.5)}return s+ground(P,"#9bb07a")},
block(st){const P=st.p;let s=sky(P);const c=[P[0],P[1],P[2]];
  s+=rect(60,90,200,116,P[1]);[[40,60,240,34],[70,28,180,34],[20,94,90,40],[210,94,90,40]].forEach(([x,y,w,h],i)=>{s+=rect(x,y,w,h,c[(i+1)%3])+rect(x,y+h-4,w,4,mix(c[(i+1)%3],"#000",.25));for(let k=x+8;k<x+w-8;k+=16)s+=rect(k,y+h*.4,10,h*.35,P[4])});
  for(let y=140;y<200;y+=18)for(let x=70;x<250;x+=20)s+=rect(x,y,12,10,P[4]);for(let x=62;x<258;x+=4)s+=line(x,90,x,206,"#000",.3,'opacity=".15"');
  s+=rect(140,178,40,28,"#2a2a2a");return s+ground(P,"#77756f")},
shard(st){const P=st.p;let s=sky(P);const cols=[P[1],P[2],P[3],mix(P[1],"#fff",.4)];
  [[[60,206],[90,90],[170,70],[150,206]],[[140,206],[120,110],[230,60],[250,206]],[[200,206],[230,120],[292,150],[282,206]],[[90,120],[190,40],[200,70],[110,140]]].forEach((pp,i)=>s+=path("M"+pp.map(p=>p.join(",")).join(" L")+"Z",cols[i%4],stroke(P[3],1.2)));
  for(let k=0;k<14;k++)s+=line(70+k*14,206,100+k*14,70+k*4,P[4],.6,'opacity=".6"');
  s+=path("M150,150 L230,110 L232,118 L152,158Z",P[3])+path("M100,170 L140,120 L144,124 L104,174Z",P[3]);return s+ground(P,mix(P[1],"#000",.2))},
wave(st){const P=st.p;let s=sky(P);
  s+=path("M20,206 C60,206 70,120 140,110 C200,100 220,60 300,70 L300,206Z","#fbfcfd");
  for(let i=1;i<9;i++)s+=path(`M${20+i*12},206 C${60+i*8},${206-i*2} ${70+i*10},${120+i*8} ${140+i*8},${110+i*9} C${200+i*6},${100+i*10} ${220+i*5},${60+i*14} 300,${70+i*14}`,"none",stroke(P[2],.7));
  s+=path("M120,206 C140,180 170,170 200,176 L200,206Z",P[3])+rect(0,206,W,34,mix(P[2],"#fff",.3))+path("M20,206 C60,206 70,226 140,224 C200,222 240,230 300,228 L300,206Z","#fbfcfd",'opacity=".35"');return s},
green(st,v={}){const P=st.p;let s=sky(P);const g1=P[1],g2=v.solar?mix(P[1],"#fff",.3):P[2],wall=v.solar?"#f7f5ee":P[4];
  if(v.solar)s+=circ(270,44,20,P[2]);s+=rect(110,40,100,166,wall);
  for(let y=52;y<200;y+=24){s+=rect(118,y+2,84,10,"#3d5a66",'opacity=".7"')+rect(100,y+14,120,5,mix(wall,"#000",.15));for(let x=104;x<222;x+=16)s+=circ(x+((y/24|0)%2?6:0),y+10,7.5,(x+y)%3?g1:g2)}
  if(v.solar){s+=path("M108,40 L132,26 L160,40Z","#2f5a8a")+path("M160,40 L186,26 L212,40Z","#2f5a8a")+line(56,206,56,92,"#eeeeee",2.5);for(const a of[0,2.1,4.2])s+=line(56,92,56+Math.cos(a)*22,92+Math.sin(a)*22,"#eeeeee",2.5)}
  for(const x of[36,262,294])s+=line(x,206,x,170,"#6b4a2b",3)+circ(x,160,16,g1);return s+ground(P,mix(g1,"#000",.2))}
};

/* Rooms */
const IT={
carved:(c,fr,x=160)=>path(`M${x-80},170 C${x-86},120 ${x-50},106 ${x-30},122 C${x-15},96 ${x+15},96 ${x+30},122 C${x+50},106 ${x+86},120 ${x+80},170Z`,c,stroke(fr,3))+rect(x-82,160,164,24,mix(c,"#000",.1),stroke(fr,2,'rx="6"'))+path(`M${x-74},184 q-7,10 -2,18`,"none",stroke(fr,3))+path(`M${x+74},184 q7,10 2,18`,"none",stroke(fr,3)),
chester:(c,x=160)=>{let s=rect(x-78,130,156,36,c,'rx="6"')+rect(x-90,140,26,46,mix(c,"#000",.15),'rx="12"')+rect(x+64,140,26,46,mix(c,"#000",.15),'rx="12"')+rect(x-66,160,132,26,mix(c,"#fff",.08),'rx="4"');for(let i=0;i<7;i++)for(let j=0;j<2;j++)s+=circ(x-60+i*20,138+j*12,1.4,mix(c,"#000",.4));return s+rect(x-84,186,6,12,"#2a1a10")+rect(x+78,186,6,12,"#2a1a10")},
low:(c,leg="#5a3a20",x=160)=>rect(x-80,134,160,30,c,'rx="4"')+rect(x-84,160,168,20,mix(c,"#000",.1),'rx="4"')+line(x-70,180,x-76,200,leg,3)+line(x+70,180,x+76,200,leg,3)+line(x-20,180,x-22,200,leg,3)+line(x+20,180,x+22,200,leg,3),
box:(c,x=160)=>rect(x-70,152,140,40,c)+rect(x-70,192,140,3,mix(c,"#000",.2)),
curvy:(c,wood,x=160)=>path(`M${x-76},182 C${x-92},130 ${x-40},150 ${x-30},126 C${x-20},104 ${x+20},104 ${x+30},126 C${x+40},150 ${x+92},130 ${x+76},182Z`,c,stroke(wood,3))+path(`M${x-76},182 C${x-80},190 ${x-70},196 ${x-74},202`,"none",stroke(wood,3))+path(`M${x+76},182 C${x+80},190 ${x+70},196 ${x+74},202`,"none",stroke(wood,3)),
settle:(wood,cush,x=160)=>{let s=rect(x-70,88,140,8,wood);for(let i=0;i<8;i++)s+=rect(x-66+i*18,96,8,64,wood);return s+rect(x-76,88,8,112,wood)+rect(x+68,88,8,112,wood)+rect(x-70,160,140,12,cush)+rect(x-70,172,140,6,wood)},
deco:(c,base,gold,x=160)=>{let s=path(`M${x-84},176 L${x-84},146 A22,22 0 0 1 ${x-62},124 L${x+62},124 A22,22 0 0 1 ${x+84},146 L${x+84},176Z`,c);for(let i=1;i<8;i++)s+=line(x-84+i*21,128,x-84+i*21,168,mix(c,"#000",.25),1.2);return s+rect(x-88,176,176,14,base)+rect(x-88,188,176,3,gold)},
neo:(c,wood,x=160)=>{let s=rect(x-74,124,148,40,c)+rect(x-74,160,148,20,mix(c,"#000",.08));for(let i=0;i<10;i++)s+=rect(x-72+i*15,124,6,56,mix(c,"#fff",.4),'opacity=".55"');return s+path(`M${x-84},180 L${x-84},146 q0,-10 10,-10`,"none",stroke(wood,5))+path(`M${x+84},180 L${x+84},146 q0,-10 -10,-10`,"none",stroke(wood,5))+rect(x-82,180,5,20,wood)+rect(x+77,180,5,20,wood)+rect(x-84,178,168,4,wood)},
memphis:(P,x=150)=>rect(x-70,140,60,40,P[1])+rect(x-10,128,80,52,P[2])+circ(x-56,132,14,P[3])+rect(x-74,180,148,10,P[4])+path(`M${x+10},150 l8,-6 l8,6 l8,-6 l8,6`,"none",stroke(P[4],2))+rect(x-74,190,10,12,P[3])+rect(x+64,190,10,12,P[1]),
platform:(wood,cush,x=160)=>rect(x-90,184,180,12,wood)+rect(x-80,170,70,14,cush,'rx="5"')+rect(x+4,170,70,14,mix(cush,"#000",.1),'rx="5"'),
light:(c,wood,x=160)=>rect(x-76,132,152,30,c,'rx="10"')+rect(x-86,146,24,34,c,'rx="10"')+rect(x+62,146,24,34,c,'rx="10"')+rect(x-66,160,132,20,mix(c,"#fff",.15),'rx="6"')+line(x-60,180,x-64,198,wood,3)+line(x+60,180,x+64,198,wood,3),
cottage:(st,x=160)=>{const p=pat(st,26);return`<defs>${p.def}</defs>`+rect(x-76,128,152,36,p.url,'rx="14"')+rect(x-86,146,26,40,p.url,'rx="12"')+rect(x+60,146,26,40,p.url,'rx="12"')+rect(x-70,162,140,30,p.url)+path(`M${x-70},192 q10,7 20,0 q10,7 20,0 q10,7 20,0 q10,7 20,0 q10,7 20,0 q10,7 20,0 q10,7 20,0`,st.p[1],stroke(st.p[1],1))},
wassily:(m,lth,x=250)=>{const L=(a,b,c,d)=>line(a,b,c,d,m,3,'stroke-linecap="round"');return L(x-26,200,x+26,200)+L(x-26,200,x-26,140)+L(x+26,200,x+26,140)+L(x-26,140,x+26,140)+rect(x-24,152,48,8,lth)+rect(x-24,120,8,40,lth)+rect(x-30,158,6,22,lth)+rect(x+24,158,6,22,lth)+L(x-20,160,x-20,118)},
redblue:(P,x=150)=>rect(x-34,100,10,90,P[4])+path(`M${x-20},96 L${x+6},96 L${x+30},160 L${x+4},160Z`,P[1])+path(`M${x-30},150 L${x+40},150 L${x+44},158 L${x-26},158Z`,P[2])+rect(x+30,128,8,72,P[4])+rect(x-40,180,90,6,P[4])+rect(x-38,186,6,14,P[3])+rect(x+42,186,6,14,P[3])+rect(x-46,140,6,6,P[3])+rect(x+40,140,6,6,P[3]),
tubetable:(m,x=110)=>rect(x-26,160,52,4,"#cfe3ea",'opacity=".85"')+line(x-22,164,x-22,200,m,2.5)+line(x+22,164,x+22,200,m,2.5),
chandelier:(gold,x=160)=>{let s=line(x,0,x,26,gold,1.5)+`<ellipse cx="${x}" cy="40" rx="40" ry="7" fill="none" stroke="${gold}" stroke-width="2.5"/>`;for(let i=0;i<8;i++){const a=i*Math.PI/4,px=x+Math.cos(a)*40,py=40+Math.sin(a)*7;s+=line(x,28,px,py,gold,1)+rect(px-1.5,py-11,3,10,"#fff8e8")+circ(px,py-13,2.5,"#ffd27a")}return s+circ(x,46,4,gold)},
fringe:(sh,x=60)=>{let s=line(x,200,x,150,"#3a2a1a",3)+path(`M${x-20},150 L${x-12},124 L${x+12},124 L${x+20},150Z`,sh);for(let i=0;i<10;i++)s+=line(x-20+i*4.4,150,x-20+i*4.4,158,sh,1);return s+rect(x-12,196,24,4,"#3a2a1a")},
fan:(gold,x=270)=>{let s=line(x,200,x,110,gold,3)+path(`M${x-22},110 A22,22 0 0 1 ${x+22},110Z`,"#fff4d6",'opacity=".9"');for(let i=0;i<6;i++){const a=Math.PI+Math.PI*(i+.5)/6;s+=line(x,110,x+Math.cos(a)*22,110+Math.sin(a)*22,gold,1)}return s+rect(x-14,196,28,5,gold)},
arc:(c,x=40)=>path(`M${x},200 L${x},80 Q${x},30 ${x+90},50`,"none",stroke(c,3))+path(`M${x+76},52 A16,16 0 0 1 ${x+108},52Z`,c)+circ(x+92,54,4,"#fff3c4")+rect(x-12,196,24,5,c),
pendant:(c,x=160)=>line(x,0,x,40,"#666",1)+path(`M${x-26},62 Q${x},40 ${x+26},62Z`,c)+path(`M${x-18},54 Q${x},36 ${x+18},54Z`,mix(c,"#fff",.25))+path(`M${x-10},46 Q${x},34 ${x+10},46Z`,c)+circ(x,64,3,"#fff6cc"),
edison:(x=160)=>[x-54,x-18,x+18,x+54].map((px,i)=>line(px,0,px,30+i%2*20,"#222",1.2)+circ(px,36+i%2*20,11,"#ffd27a",'opacity=".2"')+circ(px,36+i%2*20,6,"#ffd27a",'opacity=".95"')).join(""),
lantern:(x=64)=>{let s=line(x,0,x,26,"#888",1)+`<ellipse cx="${x}" cy="48" rx="20" ry="24" fill="#fbf4e4"/>`;for(const y of[36,48,60])s+=`<ellipse cx="${x}" cy="${y}" rx="${y===48?20:17}" ry="2" fill="none" stroke="#d8ccb4" stroke-width=".8"/>`;return s},
globe:(x=110)=>rect(x-2,140,4,20,"#e8eef0",'opacity=".8"')+path(`M${x-14},140 A14,14 0 0 1 ${x+14},140Z`,"#fdfcf8",stroke("#cccccc",1))+rect(x-10,158,20,3,"#bbbbbb"),
tiffany:(P,x=56)=>line(x,200,x,150,P[4],3)+path(`M${x-24},150 Q${x},116 ${x+24},150Z`,P[2])+path(`M${x-24},150 Q${x},132 ${x+24},150`,"none",stroke(P[1],3))+circ(x-8,138,3,P[3])+circ(x+8,138,3,P[1])+rect(x-14,196,28,4,P[4]),
giltmirror:(gold,x=160,y=62)=>`<ellipse cx="${x}" cy="${y}" rx="30" ry="38" fill="#d9e2e6" stroke="${gold}" stroke-width="6"/>`+path(`M${x-10},${y-40} q10,-14 20,0`,"none",stroke(gold,4))+path(`M${x-12},${y+40} q12,12 24,0`,"none",stroke(gold,4)),
sunmirror:(gold,x=160,y=64)=>{let s="";for(let i=0;i<24;i++){const a=i*Math.PI/12;s+=line(x+Math.cos(a)*20,y+Math.sin(a)*20,x+Math.cos(a)*(i%2?32:40),y+Math.sin(a)*(i%2?32:40),gold,2)}return s+circ(x,y,18,"#dfe8ea",stroke(gold,2))},
frames:(c,x=160)=>[[x-50,30,30,38],[x-12,22,40,30],[x+36,30,26,34],[x-12,58,24,28],[x+18,60,30,22]].map(([a,b,w,h])=>rect(a,b,w,h,"#e9e1cc",stroke(c,3))).join(""),
plate:(st,x=160,y=24,w=80,h=60)=>`<svg x="${x-w/2}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${motif(st,w,h)}</svg>`+rect(x-w/2,y,w,h,"none",stroke("#222",2)),
starclock:(c,x=160,y=62)=>{let s="";for(let i=0;i<12;i++){const a=i*Math.PI/6;s+=line(x+Math.cos(a)*10,y+Math.sin(a)*10,x+Math.cos(a)*30,y+Math.sin(a)*30,c,2)+circ(x+Math.cos(a)*30,y+Math.sin(a)*30,3,c)}return s+circ(x,y,10,c)},
scroll:(st,x=160,y=14)=>rect(x-22,y,44,96,"#f4ecdc")+rect(x-25,y-3,50,4,"#5a4a3a")+rect(x-25,y+96,50,5,"#5a4a3a")+`<svg x="${x-18}" y="${y+18}" width="36" height="36" viewBox="0 0 60 60">${M.enso(60,60,["#f4ecdc",st.p[1],"#dddddd","#cccccc",st.p[4]],rng(5))}</svg>`+rect(x+8,y+80,6,6,"#b23a2a"),
stained:(P,x=250,y=20)=>path(`M${x-28},${y+120} V${y+30} C${x-28},${y-10} ${x+28},${y-10} ${x+28},${y+30} V${y+120}Z`,P[1],stroke(P[4],3))+path(`M${x},${y+120} C${x-20},${y+80} ${x+20},${y+50} ${x},${y+10}`,"none",stroke(P[4],2))+circ(x-10,y+40,8,P[3])+circ(x+12,y+70,6,P[2]),
factory:(x=250,y=16)=>{let s=rect(x-40,y,80,110,"#c9d3d6");for(let i=1;i<4;i++)s+=line(x-40+i*20,y,x-40+i*20,y+110,"#222",2);for(let j=1;j<5;j++)s+=line(x-40,y+j*22,x+40,y+j*22,"#222",2);return s+rect(x-40,y,80,110,"none",stroke("#222",4))},
bigwindow:(sk,g,x=250,y=16)=>rect(x-50,y,100,130,sk)+circ(x-20,y+110,30,g)+circ(x+24,y+100,26,mix(g,"#fff",.2))+rect(x-50,y,100,130,"none",stroke("#e8e2d4",5))+line(x,y,x,y+130,"#e8e2d4",3),
roundmirror:(c,x=160,y=62)=>circ(x,y,30,"#dfe6e4",stroke(c,3)),
carlton:(P,x=258)=>path(`M${x},28 L${x-30},58 L${x+30},58Z`,P[1])+rect(x-4,58,8,140,P[4])+rect(x-36,90,72,6,P[2])+rect(x-26,124,52,6,P[3])+line(x-36,90,x-36,70,P[2],6)+line(x+36,90,x+36,108,P[2],6)+rect(x-30,196,60,6,P[1]),
plant:(g,x=40,pot="#b86a3c")=>{let s="";for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.42,l=36+((i*7)%4)*6;s+=path(`M${x},176 Q${f1(x+Math.cos(a)*l*.5-6)},${f1(176+Math.sin(a)*l*.5)} ${f1(x+Math.cos(a)*l)},${f1(176+Math.sin(a)*l)}`,"none",stroke(g,6,'stroke-linecap="round"'))}return s+path(`M${x-12},200 L${x-14},176 L${x+14},176 L${x+12},200Z`,pot)},
vase:(c,x=250,br=true)=>(br?path(`M${x},166 C${x-4},130 ${x+10},116 ${x+4},90 M${x+2},130 C${x+14},124 ${x+18},112 ${x+26},108`,"none",stroke("#4a3a2a",1.6)):"")+path(`M${x-9},200 C${x-16},184 ${x-12},172 ${x-4},166 L${x+5},166 C${x+13},174 ${x+15},188 ${x+8},200Z`,c),
urn:(c,x=262)=>rect(x-14,150,28,50,mix(c,"#000",.1))+path(`M${x-12},150 C${x-18},130 ${x-10},116 ${x},114 C${x+10},116 ${x+18},130 ${x+12},150Z`,c),
books:(P,x=262)=>[0,1,2,3,4].map(i=>rect(x-20+i*8,196-34-((i*5)%10),7,34+((i*5)%10),P[(i%4)+1])).join("")+rect(x-24,196,48,4,"#3a2a1a"),
cushion:(c,x=160)=>rect(x-26,184,52,14,c,'rx="6"')
};
function room(st,c){const P=st.p;let s="";const wall=c.wall||P[0];s+=rect(0,0,W,176,wall);
  if(c.wallpat){const p=pat(c.wallst||st,c.wallpat);s+=`<defs>${p.def}</defs>`+rect(0,0,W,176,p.url,`opacity="${c.wpo||.35}"`)}
  if(c.brick){for(let y=0,r=0;y<176;y+=10,r++)for(let x=r%2?-11:0;x<W;x+=22)s+=rect(x+1,y+1,20,8,(x*7+y)%3?"#8c4a32":"#a65c3d")}
  if(c.panel){for(let x=14;x<W;x+=76)s+=rect(x,20,60,130,"none",stroke(c.panel,2))}
  if(c.stripes){for(let x=0;x<W;x+=16)s+=rect(x,0,3,176,c.stripes,'opacity=".55"')}
  if(c.speck){for(let i=0;i<260;i++)s+=circ((i*97)%W,(i*53)%176,.7,c.speck,'opacity=".35"')}
  const fl=c.floor||mix(P[0],"#000",.25);s+=rect(0,176,W,64,fl);
  if(c.floorpat==="check")for(let y=176,r=0;y<240;y+=16,r++)for(let x=(r%2)*16;x<W;x+=32)s+=rect(x,y,16,16,c.floor2||"#111111",'opacity=".85"');
  if(c.floorpat==="boards")for(let y=184;y<240;y+=10)s+=line(0,y,W,y,mix(fl,"#000",.2),.8);
  if(c.floorpat==="tatami")for(let x=0;x<W;x+=80)s+=rect(x+1,178,78,60,"none",stroke(mix(fl,"#000",.25),2));
  if(c.floorpat==="terrazzo")for(let i=0;i<70;i++)s+=circ((i*61)%W,178+(i*37)%60,1.6,[P[1],P[2],P[3]][i%3]);
  s+=rect(0,172,W,5,mix(wall,"#000",.18));if(c.rug)s+=`<ellipse cx="160" cy="214" rx="120" ry="17" fill="${c.rug}"/>`;
  return s+(c.items||[]).join("")}
const ROOMS={
baroque:st=>{const P=st.p;return room(st,{wall:P[2],panel:P[1],floor:"#e8dcc4",floorpat:"check",floor2:"#3a2a20",items:[IT.giltmirror(P[1]),IT.carved(P[2],P[1]),IT.chandelier(P[1]),IT.urn(P[1],40),IT.urn(P[1],280)]})},
rococo:st=>{const P=st.p;return room(st,{wall:P[0],wallpat:22,wpo:.3,panel:P[3],floor:"#d8b88a",floorpat:"boards",items:[IT.giltmirror(P[3]),IT.carved(P[1],P[3]),IT.chandelier(P[3]),IT.plant(P[2],290,P[3])]})},
neoclassical:st=>{const P=st.p;return room(st,{wall:P[0],stripes:P[1],floor:P[2],floorpat:"boards",items:[IT.giltmirror(P[4]),IT.neo(P[3],P[4]),IT.urn(P[1],270),IT.urn(P[1],50)]})},
victorian:st=>{const P=st.p;return room(st,{wall:P[0],wallpat:20,wpo:.55,floor:"#3a2418",rug:P[1],items:[IT.frames(P[3]),IT.chester(P[1]),IT.fringe(P[3],48),IT.plant(P[2],280,"#6a4a3a")]})},
artsandcrafts:st=>{const P=st.p;return room(st,{wall:P[0],wallpat:22,wpo:.6,floor:"#8a6a44",floorpat:"boards",items:[IT.settle(P[2],P[1]),IT.books(P,272),IT.fringe(P[3],44)]})},
artnouveau:st=>{const P=st.p;return room(st,{wall:P[0],floor:"#9a7a54",floorpat:"boards",items:[IT.stained(P,252),IT.curvy(P[3],P[4],140),IT.tiffany(P,42)]})},
destijl:st=>{const P=st.p;return room(st,{wall:"#f4f1ea",floor:"#cfcac0",items:[IT.plate(st,82,24,90,90),line(250,0,250,40,"#151515",2)+rect(244,40,12,4,"#151515")+line(230,0,230,60,"#151515",2)+rect(224,60,12,4,"#151515")+line(270,0,270,52,"#151515",2)+rect(264,52,12,4,"#151515"),IT.redblue(P,190)]})},
bauhaus:st=>{const P=st.p;return room(st,{wall:"#f2efe8",floor:"#bdb6aa",items:[IT.plate(st,160,26,96,66),IT.wassily("#b9b9b9","#2a2a2a",230),IT.tubetable("#b9b9b9",104),IT.globe(104)]})},
artdeco:st=>{const P=st.p;return room(st,{wall:P[0],stripes:P[1],floor:"#f2ece0",floorpat:"check",floor2:"#111111",items:[IT.sunmirror(P[1]),IT.deco(P[2],"#111111",P[1]),IT.fan(P[1],280),IT.fan(P[1],40)]})},
scandinavian:st=>{const P=st.p;return room(st,{wall:"#f6f4ef",floor:"#d9c4a0",floorpat:"boards",rug:"#e9e4da",items:[rect(108,40,34,44,"#ffffff",stroke(P[3],2))+rect(150,48,26,34,"#ffffff",stroke(P[3],2)),IT.light("#b9bdb6",P[1]),IT.pendant(P[3],250),IT.plant(P[2],290,"#e8e2d8")]})},
midcentury:st=>{const P=st.p;return room(st,{wall:P[0],stripes:P[3],floor:P[3],floorpat:"boards",items:[IT.starclock(P[3]),IT.low(P[1]),IT.arc(P[3],28),IT.plant(P[2],292,P[4])]})},
minimalism:st=>{const P=st.p;return room(st,{wall:"#f4f2ee",floor:"#cfcac2",items:[IT.box(P[3]),IT.vase(P[1],252,false)]})},
memphis:st=>{const P=st.p;return room(st,{wall:P[0],wallpat:40,wpo:.8,floor:"#e9e2d4",floorpat:"terrazzo",items:[IT.memphis(P),IT.carlton(P)]})},
industrial:st=>room(st,{brick:1,floor:"#6b6b6b",items:[IT.factory(),path("M0,30 L196,30 Q206,30 206,40 L206,176","none",stroke("#2a2a2a",7)),IT.chester("#6b3a22",130),IT.edison(130)]}),
japandi:st=>{const P=st.p;return room(st,{wall:P[0],floor:P[1],floorpat:"boards",items:[IT.scroll(st,96),IT.platform(P[1],P[3]),IT.lantern(250),IT.vase(P[2],266),IT.plant(P[3],36,P[4])]})},
wabisabi:st=>{const P=st.p;return room(st,{wall:P[0],speck:P[2],floor:"#cbbf9a",floorpat:"tatami",items:[IT.scroll(st,160),IT.cushion(P[2],110),IT.vase(P[1],220),IT.lantern(272)]})},
cottagecore:st=>{const P=st.p;return room(st,{wall:P[0],wallpat:24,wpo:.6,floor:"#a07850",floorpat:"boards",rug:P[1],items:[IT.frames(P[2]),IT.cottage(st),IT.vase(P[4],278)+[0,1,2,3].map(i=>circ(272+i*5,100+((i*7)%10),4,i%2?P[1]:P[3])).join(""),IT.plant(P[2],36,P[3])]})},
biophilic:st=>{const P=st.p;return room(st,{wall:P[0],floor:"#a07a52",floorpat:"boards",items:[IT.bigwindow("#cfe6f0",P[1],252),IT.low(P[2],"#6b4a2b",140),IT.plant(P[1],34),IT.plant(P[2],64,"#d9cdb8"),IT.pendant("#a07a52",130)]})}
};

/* Outfits */
const torso=(f,o={})=>{const wy=o.wy||92,ww=o.ww||10,by=o.hem||wy,bw=o.hem?o.hw:ww;const nk={round:`L${CX+7},52 Q${CX},60 ${CX-7},52`,v:`L${CX+7},52 L${CX},70 L${CX-7},52`,square:`L${CX+10},52 L${CX+10},63 L${CX-10},63 L${CX-10},52`,high:`L${CX+5},45 L${CX-5},45`}[o.neck||"round"];return path(`M${CX-21},54 Q${CX-23},72 ${CX-bw},${by} L${CX+bw},${by} Q${CX+23},72 ${CX+21},54 ${nk} Z`,f)};
const skirt=(f,wy,ww,hy,hw,b=.4,e="")=>path(`M${CX-ww},${wy} C${f1(CX-ww-(hw-ww)*b)},${f1(wy+(hy-wy)*.45)} ${CX-hw},${f1(hy-(hy-wy)*.25)} ${CX-hw},${hy} Q${CX},${hy+5} ${CX+hw},${hy} C${CX+hw},${f1(hy-(hy-wy)*.25)} ${f1(CX+ww+(hw-ww)*b)},${f1(wy+(hy-wy)*.45)} ${CX+ww},${wy}Z`,f,e);
const pants=(f,wy,ww,ay,aw,e="")=>path(`M${CX-ww},${wy} L${CX+ww},${wy} L${CX+ww+2},${wy+14} L${CX+4+aw*2},${ay} L${CX+3},${ay} L${CX},${wy+26} L${CX-3},${ay} L${CX-4-aw*2},${ay} L${CX-ww-2},${wy+14}Z`,f,e);
const panel=(f,side,y2,w2)=>{const s=side;return path(`M${CX+s*21},54 Q${CX+s*25},100 ${CX+s*w2},${y2} L${CX+s*7},${y2} L${CX+s*6},56Z`,f)};
function armsF(type,c,skin){let o="";for(const s of[-1,1]){const p=[[CX+s*21,57],[CX+s*27,92],[CX+s*29,124]];
  o+=path(`M${p[0]} L${p[1]} L${p[2]}`,"none",stroke(skin,6.5,'stroke-linecap="round" stroke-linejoin="round"'))+circ(p[2][0],p[2][1]+3,3.6,skin);
  if(type&&type!=="none"){const q=[p[0][0]+(p[1][0]-p[0][0])*.35,p[0][1]+(p[1][1]-p[0][1])*.35];const seg=type==="short"||type==="puff"?`M${p[0]} L${q}`:type==="elbow"?`M${p[0]} L${p[1]}`:`M${p[0]} L${p[1]} L${p[2][0]},${p[2][1]-2}`;
    o+=path(seg,"none",stroke(c,10,'stroke-linecap="round" stroke-linejoin="round"'));
    if(type==="puff")o+=circ(p[0][0]+s*2,p[0][1]+4,8,c);
    if(type==="bell")o+=path(`M${p[1][0]-s*3},${p[1][1]} L${p[2][0]+s*11},${p[2][1]+3} L${p[2][0]-s*9},${p[2][1]+3}Z`,c);}}
  return o}
function hairBack(t,c){if(["long","messy","beanie","wavy","goth"].includes(t)){const w=t==="wavy"?26:20,y=t==="goth"?120:104;return path(`M${CX-13},26 Q${CX-w},66 ${CX-w-2},${y} L${CX+w+2},${y} Q${CX+w},66 ${CX+13},26Z`,c)}
  if(t==="lowbun")return circ(CX,45,7,c);if(t==="pony")return path(`M${CX+8},22 Q${CX+28},30 ${CX+22},72 Q${CX+16},44 ${CX+6},28Z`,c);return""}
function hairFront(t,c){const cap=path(`M${CX-12},34 Q${CX-13},17 ${CX},18 Q${CX+13},17 ${CX+12},34 Q${CX+7},23 ${CX},24 Q${CX-7},23 ${CX-12},34Z`,c);
  switch(t){
  case"bob":return path(`M${CX-15},46 Q${CX-17},16 ${CX},17 Q${CX+17},16 ${CX+15},46 L${CX+10},46 L${CX+10},28 L${CX-10},28 L${CX-10},46Z`,c);
  case"tallwig":return path(`M${CX-14},34 C${CX-25},4 ${CX-16},-18 ${CX},-20 C${CX+16},-18 ${CX+25},4 ${CX+14},34 Q${CX},20 ${CX-14},34Z`,c)+[[-8,0],[6,-8],[-4,-12],[8,8],[-10,14]].map(([dx,dy])=>circ(CX+dx,10+dy,4,mix(c,"#000",.08))).join("");
  case"updo":return cap+circ(CX-6,15,5,c)+circ(CX+5,13,6,c)+circ(CX+12,20,4,c);
  case"bun":return cap+circ(CX,13,6,c);
  case"mohawk":{let s="";for(let i=0;i<5;i++)s+=path(`M${CX-7+i*3.5},24 L${CX-5+i*3.5},${2+Math.abs(2-i)*3} L${CX-3+i*3.5},24Z`,c);return s}
  case"buns":return cap+circ(CX-10,16,6,c)+circ(CX+10,16,6,c);
  case"braid":{let s=cap;for(let i=0;i<7;i++)s+=`<ellipse cx="${CX+11+i*1.2}" cy="${38+i*8}" rx="4" ry="5" fill="${c}"/>`;return s}
  case"beanie":return cap+path(`M${CX-13},28 Q${CX},2 ${CX+13},28Z`,"#7a2a2a")+rect(CX-14,24,28,6,"#5a1f1f");
  case"hood":return path(`M${CX-16},48 Q${CX-18},12 ${CX},11 Q${CX+18},12 ${CX+16},48 L${CX+11},48 Q${CX+12},24 ${CX},23 Q${CX-12},24 ${CX-11},48Z`,c);
  case"messy":return cap+path(`M${CX-12},30 l3,7 l3,-5 l3,7 l3,-5 l3,7 l3,-5 l3,6`,c);
  default:return cap}}
function shoesF(t,c="#222222"){const L=CX-7,R=CX+7;switch(t){
  case"boot":return rect(L-5,166,10,52,c,'rx="2"')+rect(R-5,166,10,52,c,'rx="2"');
  case"chunky":return rect(L-7,204,13,12,c,'rx="3"')+rect(R-6,204,13,12,c,'rx="3"')+rect(L-7,213,13,4,"#111111")+rect(R-6,213,13,4,"#111111");
  case"platform":return rect(L-7,207,13,11,c,'rx="4"')+rect(R-6,207,13,11,c,'rx="4"');
  case"none":return"";
  default:return`<ellipse cx="${L-2}" cy="216" rx="6.5" ry="3" fill="${c}"/><ellipse cx="${R+2}" cy="216" rx="6.5" ry="3" fill="${c}"/>`}}
function outfit(st,o){const P=st.p;const p=pat(st,22);let s=rect(0,0,W,H,P[0])+`<defs>${p.def}${o.defs||""}</defs>`;
  s+=path("M92,240 V72 A68,68 0 0 1 228,72 V240Z",p.url,'opacity=".3"')+`<ellipse cx="160" cy="220" rx="56" ry="6" fill="#000" opacity=".15"/>`;
  const sk=o.skin||"#c9a083";s+=hairBack(o.hair,o.hairc);
  s+=path(`M${CX-15},106 L${CX-10},216 L${CX-4},216 L${CX-1},118Z`,o.legs||sk)+path(`M${CX+15},106 L${CX+10},216 L${CX+4},216 L${CX+1},118Z`,o.legs||sk)+(o.legx||"");
  s+=shoesF(o.shoes,o.shoec)+torso(sk)+(o.bottom||"")+(o.top||"")+armsF(o.sleeve,o.sleevec,sk);
  s+=rect(CX-4,40,8,14,sk)+circ(CX,32,11,sk)+hairFront(o.hair,o.hairc)+(o.acc||"");return s}
const OUT={
rococo:st=>{const P=st.p,q=pat(fake("vine",[P[2],P[1],P[3],P[4],P[0]],"rf"),16);return outfit(st,{defs:q.def,hair:"tallwig",hairc:"#efe9e4",sleeve:"elbow",sleevec:P[1],shoes:"none",skin:"#f0d8c8",
  bottom:path(`M${CX-10},92 L${CX-64},112 L${CX-60},216 Q${CX},222 ${CX+60},216 L${CX+64},112 L${CX+10},92Z`,P[1],stroke(P[3],2))+path(`M${CX-10},92 L${CX-26},216 L${CX+26},216 L${CX+10},92Z`,q.url)+[0,1,2].map(i=>path(`M${CX-60},${150+i*22} Q${CX},${158+i*22} ${CX+60},${150+i*22}`,"none",stroke(P[4],2))).join(""),
  top:torso(P[1],{neck:"square"})+path(`M${CX-9},63 L${CX+9},63 L${CX},96Z`,P[2])+[0,1,2].map(i=>circ(CX,70+i*8,2.5,P[3])).join(""),
  acc:path(`M${CX+30},127 L${CX+54},108 A26,26 0 0 1 ${CX+58},134Z`,P[3])+circ(CX-6,-8,4,P[2])+circ(CX+8,-4,3,P[2])})},
neoclassical:st=>{const P=st.p,wh="#fbfaf5";return outfit(st,{hair:"updo",hairc:"#5a3a28",sleeve:"puff",sleevec:wh,shoes:"flat",shoec:P[4],skin:"#e8c9b0",
  bottom:skirt(wh,70,14,216,28,.2,stroke(P[2],1))+[0,1,2,3].map(i=>line(CX-12+i*8,80,CX-16+i*10,212,P[1],1)).join(""),
  top:torso(wh,{wy:70,ww:14,neck:"square"})+rect(CX-15,68,30,5,P[3]),
  acc:path(`M${CX-31},118 Q${CX},150 ${CX+31},118`,"none",stroke(P[4],5))+path(`M${CX-12},22 Q${CX},15 ${CX+12},22`,"none",stroke(P[4],2))})},
victorian:st=>{const P=st.p;return outfit(st,{hair:"bun",hairc:"#3a2418",sleeve:"long",sleevec:P[1],shoes:"none",skin:"#ecd2c0",
  bottom:skirt(P[1],90,10,216,60,1)+[0,1,2].map(i=>path(`M${CX-34-i*9},${150+i*22} Q${CX},${160+i*22} ${CX+34+i*9},${150+i*22}`,"none",stroke(P[3],2))).join(""),
  top:torso(P[1],{neck:"high"})+[0,1,2,3].map(i=>circ(CX,58+i*8,1.6,P[3])).join("")+path(`M${CX-8},48 Q${CX},56 ${CX+8},48`,P[4]),
  acc:line(CX+29,126,CX+44,40,"#3a2418",1.8)+path(`M${CX+14},48 Q${CX+44},10 ${CX+74},48 Q${CX+44},40 ${CX+14},48Z`,P[4])})},
flapper:st=>{const P=st.p;let fr="";for(let r=0;r<3;r++)for(let x=CX-20;x<=CX+20;x+=3)fr+=line(x,118+r*17,x,133+r*17+(r===2?6:0),mix(P[1],"#000",.25),1);return outfit(st,{hair:"bob",hairc:"#141414",sleeve:"none",shoes:"heel",shoec:P[3],legs:"#d8b89a",
  bottom:skirt(P[1],112,19,168,22,.15)+fr,top:torso(P[1],{neck:"v",hem:112,hw:19})+rect(CX-20,108,40,6,P[3]),
  acc:line(CX-15,25,CX+15,25,P[3],2.5)+path(`M${CX+12},24 Q${CX+26},4 ${CX+20},-2 Q${CX+18},12 ${CX+11},22Z`,P[2])+path(`M${CX-6},52 Q${CX},110 ${CX+6},52`,"none",stroke(P[2],2.5,'stroke-dasharray="1 3" stroke-linecap="round"'))})},
surrealism:st=>{const P=st.p,wh="#f6f1e6";return outfit(st,{hair:"bun",hairc:"#2b2b2b",sleeve:"none",shoes:"none",
  bottom:skirt(wh,92,10,216,30,.2)+path("M150,150 q-14,-22 4,-32 q-2,12 9,15 q-8,6 -3,17Z",P[3])+path("M168,150 q14,-22 -4,-32 q2,12 -9,15 q8,6 3,17Z",P[3])+`<ellipse cx="160" cy="168" rx="7" ry="22" fill="${P[3]}"/>`+line(156,148,140,120,P[3],1)+line(164,148,180,120,P[3],1),
  top:torso(wh,{neck:"v"}),acc:path(`M${CX-14},14 L${CX+14},6 Q${CX+21},4 ${CX+18},16 L${CX+12},18 L${CX+10},30 L${CX+6},30 L${CX+8},18 L${CX-12},22Z`,P[4])+path(`M${CX+12},18 L${CX+18},16 L${CX+17},19Z`,P[3])})},
newlook:st=>{const P=st.p;let pl="";for(let i=-4;i<=4;i++)pl+=line(CX+i*3,104,CX+i*12,190,mix(P[1],"#fff",.15),1);return outfit(st,{hair:"bun",hairc:"#3a2a20",sleeve:"long",sleevec:P[4],shoes:"heel",shoec:P[1],
  bottom:skirt(P[1],100,12,192,56,.95)+pl,top:torso(P[4],{neck:"v"})+path(`M${CX-9},92 Q${CX-28},100 ${CX-30},114 L${CX+30},114 Q${CX+28},100 ${CX+9},92Z`,P[4])+circ(CX,80,1.6,P[1])+circ(CX,88,1.6,P[1]),
  acc:`<ellipse cx="${CX}" cy="22" rx="32" ry="6" fill="${P[1]}" transform="rotate(-10 ${CX} 22)"/>`+path(`M${CX-10},22 Q${CX},8 ${CX+10},20Z`,P[1])+circ(CX-29,127,4.5,P[1])+circ(CX+29,127,4.5,P[1])})},
mod:st=>{const P=st.p;return outfit(st,{hair:"bob",hairc:"#151515",sleeve:"none",shoes:"boot",shoec:"#f6f6f2",
  bottom:skirt(P[3],110,17,146,24,.3),top:torso(P[3],{neck:"round",hem:110,hw:17})+circ(CX,100,13,P[0])+circ(CX,100,8,P[2])+circ(CX,100,3.5,P[0]),
  acc:line(CX-6,30,CX-3,30,"#151515",1.5)+line(CX+3,30,CX+6,30,"#151515",1.5)})},
psychedelia:st=>{const P=st.p,q=pat(st,40);return outfit(st,{defs:q.def,hair:"wavy",hairc:"#6a3a1e",sleeve:"bell",sleevec:P[1],shoes:"none",
  bottom:skirt(q.url,92,10,216,42,.6),top:torso(q.url,{neck:"v"}),
  acc:path(`M${CX-13},22 Q${CX},16 ${CX+13},22`,"none",stroke(P[4],3))+[-10,-3,4,11].map((x,i)=>circ(CX+x,19,3,i%2?P[2]:P[4])).join("")})},
minimalism:st=>{const P=st.p;return outfit(st,{hair:"lowbun",hairc:"#2a2a2a",sleeve:"long",sleevec:P[1],shoes:"flat",shoec:P[1],
  bottom:skirt(P[3],92,10,206,18,.1),top:torso(P[3],{neck:"round"})+panel(P[1],-1,206,27)+panel(P[1],1,206,27)})},
punk:st=>{const P=st.p,q=pat(fake("plaid",[P[4],"#151515","#f2d22b","#151515","#efe9da"],"pk"),20);let fish="";for(let y=110;y<214;y+=6)fish+=line(CX-16,y,CX+16,y+4,"#555555",.6)+line(CX-16,y+4,CX+16,y,"#555555",.6);return outfit(st,{defs:q.def,hair:"mohawk",hairc:P[2],sleeve:"long",sleevec:P[1],shoes:"boot",shoec:P[1],legs:"#d9b8a0",legx:fish,
  bottom:skirt(q.url,100,14,142,24,.3),top:torso("#efe9da",{neck:"round"})+panel(P[1],-1,108,19)+panel(P[1],1,108,19)+[0,1,2,3].map(i=>circ(CX-16+i*2,60+i*10,1.5,"#cfcfcf")).join("")+txt(CX,82,"DIY",8,P[1],F.black2,'text-anchor="middle"'),
  acc:line(CX+10,70,CX+16,64,"#cfcfcf",1.4)+line(CX-6,40,CX-4,46,"#cfcfcf",1.2)})},
goth:st=>{const P=st.p,bk="#0c0b0e";let lace="";for(let x=CX-44;x<CX+44;x+=8)lace+=path(`M${x},214 q4,8 8,0`,"none",stroke(P[1],1.4));return outfit(st,{hair:"goth",hairc:"#060606",sleeve:"bell",sleevec:bk,shoes:"none",skin:"#e6dad4",
  bottom:skirt(bk,92,10,214,44,.7)+lace,top:torso(bk,{neck:"square"})+[0,1,2,3].map(i=>line(CX-5,68+i*6,CX+5,72+i*6,P[3],.8)+line(CX+5,68+i*6,CX-5,72+i*6,P[3],.8)).join(""),
  acc:line(CX-4,44,CX+4,44,P[2],2.5)+circ(CX,47,1.8,P[2])})},
grunge:st=>{const P=st.p,q=pat(st,24);return outfit(st,{defs:q.def,hair:"beanie",hairc:"#6a4a2a",sleeve:"long",sleevec:q.url,shoes:"chunky",shoec:"#2a2018",
  bottom:pants("#4a5a72",100,15,212,6)+rect(CX-14,160,8,6,"#c9d2de")+rect(CX+6,152,8,5,"#c9d2de"),top:torso("#2a2a2a",{neck:"round",hem:108,hw:16})+panel(q.url,-1,122,24)+panel(q.url,1,122,24)})},
preppy:st=>{const P=st.p,q=pat(st,20);let pl="";for(let i=-3;i<=3;i++)pl+=line(CX+i*4,112,CX+i*7,150,mix(P[1],"#000",.2),.8);return outfit(st,{defs:q.def,hair:"pony",hairc:"#8a5a2a",sleeve:"long",sleevec:P[1],shoes:"flat",shoec:"#5a2a1a",
  bottom:skirt(q.url,108,15,150,26,.35)+pl,top:torso(P[1],{neck:"v",hem:114,hw:18})+path(`M${CX-7},52 L${CX},70 L${CX+7},52 L${CX+4},48 L${CX-4},48Z`,"#ffffff")+path(`M${CX+8},74 h8 v8 l-4,3 l-4,-3z`,P[4]),
  acc:path(`M${CX-22},56 Q${CX},74 ${CX+22},56 Q${CX+10},66 ${CX+4},78 L${CX-2},76 Q${CX-6},66 ${CX-22},56Z`,P[2])+path(`M${CX-13},23 Q${CX},12 ${CX+13},23`,"none",stroke(P[2],2.5))})},
y2k:st=>{const P=st.p;return outfit(st,{hair:"buns",hairc:"#d9b26a",sleeve:"short",sleevec:P[3],shoes:"platform",shoec:"#ffffff",
  bottom:pants("#9fc3e6",102,15,214,10),top:torso(P[3],{neck:"round",wy:84,ww:11})+path(`M${CX},62 l2.4,5 5.4,.6 -4,3.7 1.1,5.3 -4.9,-2.7 -4.9,2.7 1.1,-5.3 -4,-3.7 5.4,-.6z`,"#ffffff"),
  acc:rect(CX-10,28,8,5,P[4],'rx="2" opacity=".9"')+rect(CX+2,28,8,5,P[4],'rx="2" opacity=".9"')+line(CX-2,30,CX+2,30,P[4],1)+path(`M${CX-16},14 l5,-4 l0,8z M${CX+16},14 l-5,-4 l0,8z`,P[4])})},
techwear:st=>{const P=st.p;return outfit(st,{hair:"hood",hairc:P[1],sleeve:"long",sleevec:P[1],shoes:"chunky",shoec:P[1],
  bottom:pants("#1e1f22",116,16,212,5)+rect(CX-24,140,10,14,P[2])+rect(CX+14,140,10,14,P[2])+line(CX-14,206,CX-4,206,P[3],2),
  top:torso(P[1],{neck:"high",hem:118,hw:19})+line(CX-20,58,CX+18,104,P[2],3)+line(CX+20,58,CX-18,104,P[2],3)+rect(CX-4,78,8,6,P[3]),
  acc:rect(CX-9,34,18,9,"#0e0e10",'rx="3"')})},
cottagecore:st=>{const P=st.p,q=pat(st,22);return outfit(st,{defs:q.def,hair:"braid",hairc:"#b8865a",sleeve:"puff",sleevec:q.url,shoes:"chunky",shoec:"#6a4a2a",
  bottom:skirt(q.url,92,10,190,42,.6)+path(`M${CX-30},130 Q${CX},136 ${CX+30},130`,"none",stroke(P[1],1.6))+path(`M${CX-38},160 Q${CX},166 ${CX+38},160`,"none",stroke(P[1],1.6)),top:torso(q.url,{neck:"square"}),
  acc:path(`M${CX+20},128 L${CX+46},128 L${CX+42},146 L${CX+24},146Z`,"#b8865a")+path(`M${CX+22},128 Q${CX+33},110 ${CX+44},128`,"none",stroke("#8a603a",2))+circ(CX+26,126,4,P[1])+circ(CX+34,124,4,P[3])+circ(CX+41,126,4,P[1])})},
darkacademia:st=>{const P=st.p,q=pat(st,18);let pl="";for(let i=-4;i<=4;i++)pl+=line(CX+i*3,114,CX+i*6.5,176,P[4],.7);return outfit(st,{defs:q.def,hair:"lowbun",hairc:"#3a2418",sleeve:"long",sleevec:q.url,shoes:"flat",shoec:"#1e140c",legs:"#2a2420",
  bottom:skirt(P[3],110,15,178,28,.3)+pl,top:torso("#1e1a18",{neck:"high"})+panel(q.url,-1,118,22)+panel(q.url,1,118,22),
  acc:`<g transform="rotate(-14 ${CX+40} 108)">`+rect(CX+28,96,26,6,P[4])+rect(CX+30,102,24,6,P[2])+rect(CX+27,108,28,6,"#5a2a20")+`</g>`})},
quietluxury:st=>{const P=st.p;return outfit(st,{hair:"lowbun",hairc:"#6a4a30",sleeve:"long",sleevec:P[1],shoes:"flat",shoec:P[3],
  bottom:pants(P[2],96,14,214,13),top:torso(P[4],{neck:"round"})+panel(P[1],-1,200,28)+panel(P[1],1,200,28)+path(`M${CX-7},56 L${CX-14},80 L${CX-8},74Z`,mix(P[1],"#000",.15))+path(`M${CX+7},56 L${CX+14},80 L${CX+8},74Z`,mix(P[1],"#000",.15)),
  acc:rect(CX+26,124,18,14,P[3],'rx="3"')+path(`M${CX+29},124 Q${CX+35},116 ${CX+41},124`,"none",stroke(P[3],1.5))})}
};

/* Posters and prints */
const POST={
renaissance:st=>{const P=st.p;let s=rect(0,0,W,H,P[0]);for(let i=-8;i<=8;i++)s+=line(160,118,160+i*40,240,P[2],.8);for(let k=1;k<7;k++){const y=118+Math.pow(k/6,1.7)*122;s+=line(0,y,W,y,P[2],.8)}
  s+=rect(0,0,W,118,mix(P[0],"#fff",.25));for(let i=0;i<5;i++){const x=40+i*60;s+=rw(x-16,46,32,72,mix(P[3],"#fff",.25))+rect(x-22,40,6,78,P[1])}
  s+=rect(14,34,292,8,P[1])+txt(160,26,"PROSPETTIVA",20,P[2],F.cinzel,'text-anchor="middle" font-weight="700" letter-spacing="4"')+circ(160,168,14,P[4])+`<ellipse cx="160" cy="184" rx="16" ry="3" fill="#000" opacity=".2"/>`;return s},
baroque:st=>{const P=st.p,g=uid();let s=`<defs><radialGradient id="${g}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${P[3]}"/><stop offset=".45" stop-color="${mix(P[2],P[0],.3)}"/><stop offset="1" stop-color="${P[0]}"/></radialGradient></defs>`+rect(0,0,W,H,`url(#${g})`);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;s+=line(160,120,160+Math.cos(a)*70,120+Math.sin(a)*70,P[1],1,'opacity=".6"')}s+=circ(160,120,22,P[1],'opacity=".85"');
  s+=path("M0,0 L320,0 L320,30 C260,62 220,20 160,42 C100,20 60,62 0,30Z",P[2])+path("M0,0 C22,80 10,160 32,240 L0,240Z",P[2])+path("M320,0 C298,80 310,160 288,240 L320,240Z",P[2]);
  for(const x of[60,110,160,210,260])s+=path(`M${x-26},32 Q${x},54 ${x+26},32`,"none",stroke(P[1],2));
  s+=rect(46,190,228,32,"none",stroke(P[1],2))+txt(160,213,"TEATRO SACRO",18,P[1],F.cinzel,'text-anchor="middle" font-weight="700" letter-spacing="3"');return s},
rococo:st=>{const P=st.p,cid=uid();let s=rect(0,0,W,H,P[0])+`<defs><clipPath id="${cid}"><ellipse cx="160" cy="106" rx="78" ry="86"/></clipPath></defs><g clip-path="url(#${cid})">${motif(st,W,H)}</g><ellipse cx="160" cy="106" rx="78" ry="86" fill="none" stroke="${P[3]}" stroke-width="6"/>`;
  s+=line(132,22,148,118,P[3],1.2)+line(188,22,172,118,P[3],1.2)+path("M138,118 L182,118 L186,122 L134,122Z",P[3])+path("M148,118 C140,100 150,92 160,90 C172,92 180,104 172,118Z",P[1])+circ(160,84,6,"#f3dccf");
  for(let i=0;i<14;i++){const a=Math.PI*.18+i*Math.PI*.05;s+=circ(160+Math.cos(a)*84,106+Math.sin(a)*92,5,i%2?P[1]:P[2])}
  return s+txt(160,230,"Fête Galante",26,P[3],F.dancing,'text-anchor="middle"')},
ukiyoe:st=>{const P=st.p;let s=rect(0,0,W,H,P[0])+path("M190,170 L230,120 L270,170Z",P[2])+path("M220,132 L230,120 L240,132 L234,130 L230,134 L226,130Z","#ffffff");
  s+=path("M0,240 L0,170 C30,120 80,60 150,50 C200,44 230,70 220,100 C212,80 190,74 176,84 C200,90 200,120 176,130 C150,140 130,120 150,104 C120,110 100,170 120,240Z",P[1]);
  for(let i=0;i<9;i++)s+=circ(150+Math.cos(i*.3)*30-i*6,52+i*6,4,"#f4efe4");
  s+=path("M0,240 L0,200 C40,180 80,200 120,190 C160,180 200,200 240,190 C280,182 300,200 320,196 L320,240Z",P[2]);for(let i=0;i<10;i++)s+=path(`M${i*34},212 q8,-8 16,0`,"none",stroke("#f4efe4",1.5));
  s+=rect(276,14,30,100,"#efe3c8",stroke(P[4],1.5))+"OCEAN".split("").map((c,i)=>txt(291,34+i*18,c,14,P[4],F.cinzel,'text-anchor="middle" font-weight="700"')).join("")+rect(281,120,20,20,P[3]);return s},
artsandcrafts:st=>{const P=st.p,p=pat(st,20);let s=rect(0,0,W,H,"#efe6d0")+`<defs>${p.def}</defs>`+rect(16,12,288,216,p.url)+rect(36,30,248,180,"#f6f0de");
  s+=rect(52,46,52,52,P[1])+txt(78,90,"T",46,"#f6f0de",F.cinzel,'text-anchor="middle" font-weight="700"')+txt(114,66,"HE GARDEN",20,P[4],F.cinzel,'font-weight="700"');
  for(let i=0;i<9;i++)s+=rect(i<2?114:52,80+i*13,(i<2?150:212)-((i*13)%30),4,mix(P[4],"#f6f0de",.5));return s},
artnouveau:st=>{const P=st.p;let s=rect(0,0,W,H,P[0])+path("M40,240 V80 C40,10 280,10 280,80 V240Z",mix(P[0],P[2],.25),stroke(P[4],3))+circ(160,92,52,P[2],'opacity=".8"');
  for(let i=0;i<24;i++){const a=i*Math.PI/12;s+=circ(160+Math.cos(a)*52,92+Math.sin(a)*52,3,P[3])}
  s+=path("M150,70 C150,58 166,54 172,64 C176,70 174,78 178,82 L172,84 C172,92 166,100 158,100 C150,100 146,86 150,70Z","#f3e3cc");
  for(let i=0;i<7;i++)s+=path(`M${152-i*2},${66+i} C${120-i*10},${80+i*8} ${170-i*14},${130+i*6} ${110-i*12},${170+i*6}`,"none",stroke(i%2?P[4]:P[3],3-i*.2,'stroke-linecap="round"'));
  for(let k=0;k<5;k++){const x=184+k*16,y=140+k*10;for(let p=0;p<5;p++)s+=`<ellipse cx="${x}" cy="${y-5}" rx="2.5" ry="5" fill="${P[3]}" transform="rotate(${p*72} ${x} ${y})"/>`}
  return s+rect(40,196,240,44,P[4])+txt(160,227,"Salon des Fleurs",27,P[0],F.smythe,'text-anchor="middle"')},
constructivism:st=>{const P=st.p;let s=rect(0,0,W,H,P[0])+circ(200,110,70,"#f4efe2")+path("M10,226 L236,98 L208,146Z",P[1]);
  s+=`<g transform="rotate(-28 160 120)">`+rect(-30,150,380,28,P[2])+txt(14,171,"BUILD TOMORROW",22,P[0],F.black2,'font-weight="900"')+rect(40,60,120,8,P[2])+`</g>`;return s+rect(20,20,40,40,P[2])+circ(284,212,14,P[1])},
destijl:st=>{const P=st.p;return M.mondrian(W,H,P,rng(hash(st.id)+9))+rect(16,184,150,40,P[0],stroke(P[4],4))+txt(26,211,"neo plastic",21,P[4],F.helv,'font-weight="700"')},
bauhaus:st=>{const P=st.p;return rect(0,0,W,H,P[0])+circ(110,112,70,P[1])+path("M196,204 L252,52 L308,204Z",P[3])+rect(150,122,60,60,P[2])+rect(20,204,180,8,P[4])+line(20,40,20,190,P[4],2)+txt(300,26,"ausstellung",22,P[4],F.helv,'text-anchor="end" font-weight="700"')+txt(20,232,"1923 weimar",15,P[4],F.helv,'font-weight="700"')},
artdeco:st=>{const P=st.p;let s=rect(0,0,W,H,P[0]);for(let i=0;i<20;i++){const a=Math.PI+Math.PI*(i+.5)/20;s+=path(`M160,150 L${f1(160+Math.cos(a)*320)},${f1(150+Math.sin(a)*320)} L${f1(160+Math.cos(a+.05)*320)},${f1(150+Math.sin(a+.05)*320)}Z`,P[1],'opacity=".35"')}
  s+=path("M60,240 L150,150 L170,150 L260,240Z",P[2])+line(118,240,156,150,P[1],2)+line(202,240,164,150,P[1],2)+path("M110,182 Q110,120 160,116 Q210,120 210,182 L210,200 L110,200Z","#1a1a1a")+circ(160,150,14,P[3])+circ(160,150,8,"#fff6cc")+rect(120,186,80,4,P[1])+rect(126,194,68,3,P[1]);
  return s+rect(0,206,W,34,P[4])+txt(160,232,"NIGHT EXPRESS",24,P[3],F.limelight,'text-anchor="middle" letter-spacing="2"')+txt(160,30,"PARIS   VENISE   ISTANBUL",11,P[3],F.limelight,'text-anchor="middle" letter-spacing="2"')},
surrealism:st=>{const P=st.p;let s=M.horizon(W,H,P,rng(hash(st.id)))+rect(200,40,50,90,P[1],stroke(P[4],3))+rect(204,44,42,82,mix(P[1],"#fff",.45))+`<ellipse cx="226" cy="70" rx="14" ry="5" fill="#ffffff"/>`;
  for(let i=0;i<8;i++)s+=line(73+i*1.6,166-i*18,97+i*1.6,166-i*18,P[2],2);return s+line(70,172,84,26,P[2],2)+line(94,172,108,26,P[2],2)+txt(24,226,"Les Rêves",30,P[4],F.fraunces,'font-style="italic"')},
swiss:st=>{const P=st.p;let s=rect(0,0,W,H,P[0]);for(let i=1;i<8;i++)s+=line(i*40,0,i*40,H,P[3],.5);s+=circ(222,96,74,P[1])+circ(222,96,40,"none",stroke(P[0],6))+txt(18,190,"konzert",48,P[2],F.helv,'font-weight="700" letter-spacing="-2"');
  [["tonhalle zürich",206],["13. juni",219],["beethoven strawinsky",232]].forEach(([t,y])=>s+=txt(20,y,t,10,P[2],F.helv));return s},
popart:st=>{const P=st.p;return M.halftone(W,H,P,rng(3))+txt(160,136,"POW!",46,P[1],F.bangers,`text-anchor="middle" stroke="${P[3]}" stroke-width="2"`)+`<ellipse cx="70" cy="40" rx="58" ry="26" fill="#ffffff" stroke="${P[3]}" stroke-width="2"/>`+path("M60,64 L48,84 L78,64Z","#ffffff",stroke(P[3],2))+txt(70,46,"IS THIS ART?",15,P[3],F.bangers,'text-anchor="middle"')},
opart:st=>{let s=rect(0,0,W,H,"#f4f4f0");for(let r=0;r<12;r++){let x=0;for(let c=0;x<W;c++){const wv=8+12*Math.abs(Math.sin(c*.45+r*.38));if((r+c)%2)s+=rect(x,r*20,wv,20,"#151515");x+=wv}}return s+rect(16,198,118,28,"#f4f4f0")+txt(24,218,"vibration",18,"#151515",F.helv,'font-weight="700"')},
psychedelia:st=>{const P=st.p,id=uid();return M.psych(W,H,P,rng(2))+`<defs><path id="${id}" d="M14,196 C80,150 120,236 180,192 S270,150 314,188"/></defs><text font-family='${F.righteous}' font-size="34" fill="${P[4]}" stroke="${P[1]}" stroke-width="1.5"><textPath href="#${id}">Dance Concert</textPath></text>`+txt(160,36,"FRIDAY & SATURDAY",12,P[4],F.righteous,'text-anchor="middle" letter-spacing="2"')},
minimalism:st=>{const P=st.p;return rect(0,0,W,H,P[0])+rect(120,66,80,80,P[1])+line(40,190,280,190,P[1],.8)+txt(40,214,"Untitled, 1965",11,P[4],F.helv,'letter-spacing="1"')},
punk:st=>{const P=st.p;let s=rect(0,0,W,H,"#e9e6dd")+`<g transform="rotate(-3 160 90)"><svg x="30" y="28" width="260" height="124" viewBox="0 0 260 124">${M.ransom(260,124,P,rng(hash(st.id)))}</svg></g>`;
  for(let i=0;i<300;i++)s+=circ((i*73)%W,(i*131)%H,.7,"#111111",'opacity=".25"');
  return s+rect(20,170,280,50,"#111111")+txt(32,203,"GIG TONITE 8PM",22,"#e9e6dd",F.elite)+rect(40,18,54,14,"#d8d2b8",'opacity=".85" transform="rotate(-12 67 25)"')+rect(240,142,54,14,"#d8d2b8",'opacity=".85" transform="rotate(14 267 149)"')},
memphis:st=>{const P=st.p;return M.confetti(W,H,P,rng(4))+rect(200,24,70,70,P[2])+circ(80,62,30,P[3])+path("M30,140 q20,-30 40,0 t40,0 t40,0 t40,0 t40,0","none",stroke(P[4],8,'stroke-linecap="round"'))+rect(40,170,240,50,P[0])+txt(160,206,"MILANO 81",32,P[1],F.righteous,`text-anchor="middle" stroke="${P[4]}" stroke-width="1"`)},
cyberpunk:st=>{const P=st.p,g=uid();return M.neon(W,H,P,rng(hash(st.id)))+`<defs><filter id="${g}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="3"/></filter></defs><text x="160" y="70" text-anchor="middle" font-family='${F.vt}' font-size="36" fill="${P[2]}" filter="url(#${g})">NEON DISTRICT</text>`+txt(160,70,"NEON DISTRICT",36,"#ffe6f6",F.vt,'text-anchor="middle"')+txt(160,96,"24H // NO SLEEP",16,P[3],F.vt,'text-anchor="middle"')},
vaporwave:st=>{const P=st.p;return M.vapor(W,H,P,rng(1))+path("M226,240 C226,214 236,200 250,196 L252,186 C242,180 240,160 244,146 C248,128 266,122 278,130 C292,140 290,164 282,178 L284,196 C298,200 308,214 308,240Z","#f2eef6")+path("M244,146 C252,134 274,128 286,140","none",stroke("#d8d0e0",3))+txt(22,52,"ＤＲＥＡＭ ＭＡＬＬ",24,"#ffffff",F.fraunces,`stroke="${P[1]}" stroke-width=".8"`)+txt(24,74,"ドリーム",14,P[3],F.atk)},
flatdesign:st=>{const P=st.p;return rect(0,0,W,H,P[0])+circ(240,70,34,P[4])+path("M0,190 Q80,120 160,170 T320,150 L320,240 L0,240Z",P[1])+path("M0,210 Q100,170 200,200 T320,190 L320,240 L0,240Z",mix(P[1],"#000",.15))+txt(24,60,"Hello.",34,"#2c3e50",F.helv,'font-weight="700"')+txt(24,82,"Simple, clear, flat.",13,"#7f8c8d",F.helv)+rect(24,96,104,30,P[2],'rx="6"')+txt(76,116,"Get started",12,"#ffffff",F.helv,'text-anchor="middle" font-weight="700"')},
wabisabi:st=>{const P=st.p;let s=rect(0,0,W,H,P[0]);for(let i=0;i<400;i++)s+=circ((i*97)%W,(i*53)%H,.6,P[2],'opacity=".35"');
  return s+rect(108,14,104,206,"#f6efe0")+rect(102,10,116,6,"#3a342d")+rect(102,218,116,8,"#3a342d")+`<svg x="120" y="38" width="80" height="80" viewBox="0 0 60 60">${M.enso(60,60,["#f6efe0",P[1],"#dddddd","#cccccc",P[4]],rng(7))}</svg>`+txt(160,160,"ichi-go ichi-e",12,P[1],F.fraunces,'text-anchor="middle" font-style="italic"')+rect(186,188,12,12,"#b23a2a")}
};

/* Screens */
function frame(kind,bg,body,content){const c=uid();let s=rect(0,0,W,H,bg),x,y,w,h;
  if(kind==="phone"){s+=rect(102,8,116,228,body,'rx="18"');x=110;y=22;w=100;h=200}
  if(kind==="monitor"){s+=rect(36,14,248,170,body,'rx="8"')+rect(140,184,40,24,body)+rect(110,206,100,8,body,'rx="3"');x=46;y=24;w=228;h=150}
  if(kind==="crt"){s+=path("M46,10 L274,10 Q290,10 290,26 L284,180 Q270,216 160,222 Q50,216 36,180 L30,26 Q30,10 46,10Z",body,'opacity=".88"')+path("M70,200 Q160,214 250,200","none",stroke("#ffffff",3,'opacity=".5"'));x=54;y=24;w=212;h=150}
  if(kind==="tablet"){s+=rect(30,16,260,208,body,'rx="16"');x=42;y=28;w=236;h=184}
  return s+`<defs><clipPath id="${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${kind==="phone"?8:3}"/></clipPath></defs><g clip-path="url(#${c})">${content(x,y,w,h)}</g>`}
const SCR={
cyberpunk:st=>{const P=st.p;return frame("monitor",mix(P[0],"#000",.3),"#1c1c24",(x,y,w,h)=>{let s=rect(x,y,w,h,"#05040d");for(let i=0;i<12;i++)s+=line(x,y+h-i*i*1.1,x+w,y+h-i*i*1.1,P[3],.5,'opacity=".35"');for(let i=-8;i<=8;i++)s+=line(x+w/2,y+h*.45,x+w/2+i*30,y+h,P[3],.5,'opacity=".35"');
  ["> ACCESS GRANTED","> SECTOR 7 // LINK UP","> NEURAL SYNC 87%"].forEach((t,i)=>s+=txt(x+10,y+22+i*16,t,15,i===1?P[2]:P[3],F.vt));return s+rect(x+10,y+70,w*.6,6,P[2])+rect(x+10,y+70,w*.6*.87,6,P[3])})},
y2k:st=>{const P=st.p;return frame("crt",P[0],P[4],(x,y,w,h)=>{const g=uid();let s=`<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P[1]}"/><stop offset="1" stop-color="${P[2]}"/></linearGradient></defs>`+rect(x,y,w,h,`url(#${g})`);
  s+=rect(x+16,y+16,120,80,"#ffffff",'rx="12" opacity=".85"')+rect(x+16,y+16,120,16,P[3],'rx="8"')+txt(x+24,y+29,"ONLINE",10,"#ffffff",F.orbitron,'font-weight="800"')+[0,1,2].map(i=>circ(x+36+i*30,y+64,10,[P[3],P[4],"#b9f27a"][i],'opacity=".9"')+circ(x+33+i*30,y+60,3,"#ffffff")).join("");
  return s+txt(x+w-10,y+h-12,"Y2K OK",14,"#ffffff",F.orbitron,'text-anchor="end" font-weight="800"')})},
frutigeraero:st=>{const P=st.p;return frame("monitor","#dfe8ef","#1a1a1a",(x,y,w,h)=>{let s=`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${M.aero(w,h,P,rng(3))}</svg>`;
  s+=rect(x+40,y+20,140,90,"#ffffff",'rx="8" opacity=".35"')+rect(x+40,y+20,140,18,"#ffffff",'rx="8" opacity=".55"')+txt(x+50,y+33,"Welcome",10,"#1a4a7a",F.atk,'font-weight="700"');
  return s+rect(x,y+h-16,w,16,"#ffffff",'opacity=".4"')+circ(x+12,y+h-8,9,"#4fbf4a",stroke("#ffffff",1.5))})},
skeuomorphism:st=>{const P=st.p;return frame("phone",mix(P[0],"#fff",.75),"#1b1b1e",(x,y,w,h)=>{let s=rect(x,y,w,h,"#fbf1a9")+rect(x,y,w,28,P[0])+rect(x+2,y+2,w-4,24,"none",stroke(P[1],1,'stroke-dasharray="3 2"'))+txt(x+w/2,y+19,"Notes",12,P[1],F.helv,'text-anchor="middle" font-weight="700"');
  for(let ly=y+44;ly<y+h;ly+=14)s+=line(x,ly,x+w,ly,"#a8c8e8",.7);s+=line(x+14,y+28,x+14,y+h,"#e8a0a0",1);
  ["Groceries","- bread","- figs","- call mum"].forEach((t,i)=>s+=txt(x+18,y+42+i*14,t,12,"#3a3a6a",F.dancing));return s})},
vaporwave:st=>{const P=st.p;return frame("monitor",P[0],"#c8c3b4",(x,y,w,h)=>{let s=rect(x,y,w,h,"#008080")+rect(x+24,y+14,170,112,"#c0c0c0",stroke("#ffffff",1.5))+rect(x+27,y+17,164,14,"#000080")+txt(x+32,y+28,"dream.exe",10,"#ffffff",F.helv,'font-weight="700"')+rect(x+178,y+19,10,10,"#c0c0c0");
  s+=`<svg x="${x+28}" y="${y+34}" width="162" height="88" viewBox="0 0 162 88" preserveAspectRatio="xMidYMid slice">${M.vapor(162,88,P,rng(2))}</svg>`;return s+rect(x,y+h-14,w,14,"#c0c0c0")+rect(x+3,y+h-12,40,10,"#c0c0c0",stroke("#808080",1))+txt(x+8,y+h-4,"Start",8,"#000000",F.helv,'font-weight="700"')})},
flatdesign:st=>{const P=st.p;return frame("phone",mix(P[0],P[2],.15),"#2c3e50",(x,y,w,h)=>rect(x,y,w,h,"#ffffff")+rect(x,y,w,30,P[2])+txt(x+10,y+20,"Home",12,"#ffffff",F.helv,'font-weight="700"')+`<svg x="${x}" y="${y+34}" width="${w}" height="${h-34}" viewBox="0 0 ${w} ${h-34}">${M.flat(w,h-34,["#ffffff",P[1],P[2],P[3],P[4]],rng(1))}</svg>`)},
cottagecore:st=>{const P=st.p;return frame("phone",P[0],"#efe6da",(x,y,w,h)=>{let s=rect(x,y,w,h,"#fffaf2")+txt(x+w/2,y+24,"cottage diary",15,"#8a5a4a",F.dancing,'text-anchor="middle"');
  const tiles=[fake("gingham",P,"c1"),fake("leaves",["#e9efe0","#7fa06a","#c7d9a8","#a8c08a","#ffffff"],"c2"),fake("vine",[P[0],P[2],P[1],P[3],P[4]],"c3"),fake("enso",["#f6efe0","#a07850","#dddddd","#cccccc","#a07850"],"c4"),fake("gingham",[P[0],P[4],P[2],P[3],P[1]],"c5"),fake("leaves",["#f5efe1","#e6a9b5","#f2d48a","#9cb58a","#ffffff"],"c6")];
  tiles.forEach((t,i)=>{const tx=x+6+(i%2)*46,ty=y+36+Math.floor(i/2)*50;s+=`<svg x="${tx}" y="${ty}" width="42" height="46" viewBox="0 0 42 46" preserveAspectRatio="xMidYMid slice">${motif(t,42,46)}</svg>`});
  return s+circ(x+18,y+h-14,4,P[1])+txt(x+28,y+h-10,"124 likes",9,"#8a5a4a",F.atk)})},
solarpunk:st=>{const P=st.p;return frame("tablet",P[0],"#f6f6f0",(x,y,w,h)=>{let s=rect(x,y,w,h,"#fbfdf6")+txt(x+14,y+24,"Commons Energy",16,P[3],F.fraunces,'font-weight="700"')+circ(x+w-26,y+20,9,P[2]);
  for(let i=0;i<7;i++){const bh=20+((i*37)%50);s+=rect(x+18+i*22,y+h-30-bh,14,bh,i%2?P[1]:P[3],'rx="3"')}
  s+=path(`M${x+180},${y+h-40} A40,40 0 0 1 ${x+260},${y+h-40}`,"none",stroke("#e8eadd",10))+path(`M${x+180},${y+h-40} A40,40 0 0 1 ${x+246},${y+h-68}`,"none",stroke(P[2],10));
  return s+txt(x+220,y+h-44,"82%",14,P[3],F.atk,'text-anchor="middle" font-weight="700"')+path(`M${x+14},${y+44} q10,-12 20,0 q-10,12 -20,0z`,P[1])+txt(x+40,y+50,"14 gardens growing",11,"#4a5a4a",F.atk)})}
};

/* Lettering specimens */
const TYPE={gothic:["black",{fx:"init"}],renaissance:["cinzel",{upper:1,sp:3}],baroque:["cinzel",{upper:1,sp:2,fx:"flourish"}],rococo:["dancing",{fx:"flourish"}],neoclassical:["cinzel",{upper:1,sp:8}],gothicrevival:["black",{}],ukiyoe:["fraunces",{fx:"vertical"}],victorian:["graduate",{upper:1,fx:"rules"}],artsandcrafts:["smythe",{fx:"rules"}],artnouveau:["smythe",{fx:"flourish"}],
  constructivism:["black2",{upper:1,fx:"tilt"}],destijl:["black2",{upper:1,fx:"blocks"}],bauhaus:["helv",{lower:1,bold:1,fx:"shapes"}],artdeco:["limelight",{upper:1,sp:3,fx:"steps"}],flapper:["limelight",{fx:"steps"}],surrealism:["fraunces",{italic:1,fx:"melt"}],modernism:["helv",{lower:1}],scandinavian:["atk",{lower:1,light:1}],newlook:["fraunces",{italic:1}],midcentury:["pacifico",{fx:"star"}],
  brutalism:["black2",{upper:1,tight:1}],swiss:["helv",{lower:1,bold:1,fx:"left"}],popart:["bangers",{upper:1,fx:"outline"}],opart:["black2",{upper:1,fx:"stripes"}],mod:["righteous",{fx:"roundel"}],psychedelia:["righteous",{fx:"wave"}],minimalism:["helv",{lower:1,sp:6,small:1}],punk:["helv",{fx:"ransom"}],postmodernism:["fraunces",{fx:"colors",bold:1}],goth:["black",{}],
  memphis:["righteous",{fx:"shadow"}],cyberpunk:["vt",{upper:1,fx:"glow"}],deconstructivism:["helv",{bold:1,fx:"rotate"}],industrial:["stencil",{upper:1}],grunge:["elite",{fx:"distress"}],preppy:["graduate",{upper:1,fx:"outline"}],y2k:["orbitron",{upper:1,fx:"chrome"}],frutigeraero:["atk",{bold:1,fx:"gloss"}],skeuomorphism:["helv",{bold:1,fx:"emboss"}],parametricism:["atk",{fx:"wave"}],
  vaporwave:["fraunces",{full:1,fx:"grad"}],flatdesign:["helv",{bold:1}],techwear:["orbitron",{upper:1,sp:2}],japandi:["atk",{lower:1,light:1,sp:4}],wabisabi:["fraunces",{italic:1,fx:"enso"}],cottagecore:["dancing",{fx:"flourish"}],darkacademia:["cinzel",{upper:1,sp:2}],quietluxury:["cinzel",{upper:1,sp:9,small:1}],solarpunk:["fraunces",{bold:1,fx:"sun"}],biophilic:["fraunces",{fx:"leaf"}]};
function typeSpec(st){const P=st.p,[fk,o]=TYPE[st.id]||["fraunces",{}],fam=F[fk];let name=st.n;
  if(o.upper)name=name.toUpperCase();if(o.lower)name=name.toLowerCase();if(o.full)name=[...name].map(c=>c===" "?"\u3000":String.fromCharCode(c.charCodeAt(0)+0xFEE0)).join("");
  const fg=pickC(P),bg=P[0],k=(FK[fk]||.6)*(o.full?1.7:1),sp=o.sp||0,n=[...name].length;
  let size=Math.min(o.small?30:66,(270-n*sp)/(n*k));const est=n*(size*k+sp),fit=est>280?` textLength="280" lengthAdjust="spacingAndGlyphs"`:"";
  const wt=o.bold?' font-weight="700"':o.light?' font-weight="300"':"",it=o.italic?' font-style="italic"':"",ls=sp?` letter-spacing="${sp}"`:"";
  const base=(x,y,fill,extra="",anchor="middle")=>`<text x="${x}" y="${y}" font-size="${f1(size)}" fill="${fill}" font-family='${fam}' text-anchor="${anchor}"${wt}${it}${ls}${fit} ${extra}>${esc(name)}</text>`;
  let s=rect(0,0,W,H,bg),y=132;
  const perLetter=(fn)=>{const adv=size*k+sp,x0=160-adv*n/2;return[...name].map((c,i)=>fn(c,x0+adv*(i+.5),i)).join("")};
  switch(o.fx){
  case"init":s+=`<text x="160" y="${y}" font-size="${f1(size)}" fill="${fg}" font-family='${fam}' text-anchor="middle"><tspan fill="${P[3]}" font-size="${f1(size*1.25)}">${esc(name[0])}</tspan>${esc(name.slice(1))}</text>`;break;
  case"vertical":size=22;s+=[...name].map((c,i)=>txt(160,46+i*21,c,20,fg,fam,'text-anchor="middle" font-weight="700"')).join("")+rect(184,40,18,18,P[3]);break;
  case"tilt":s+=`<g transform="rotate(-14 160 120)">${rect(10,y+10,300,10,P[1])}${base(160,y,fg,'font-weight="900"')}</g>`;break;
  case"blocks":s+=rect(30,60,10,110,P[4])+rect(280,80,10,90,P[4])+rect(40,60,60,20,P[1])+rect(220,150,60,20,P[2])+rect(250,60,30,20,P[3])+base(160,y,P[4]);break;
  case"shapes":s+=circ(60,60,26,P[1])+path("M250,84 L274,40 L298,84Z",P[3])+rect(252,170,34,34,P[2])+base(160,y,P[4]);break;
  case"steps":for(let i=0;i<3;i++)s+=rect(160-60+i*20,y-size-20-i*6,120-i*40,3,P[1])+rect(160-60+i*20,y+16+i*6,120-i*40,3,P[1]);s+=base(160,y,fg);break;
  case"melt":s+=base(160,y,fg)+[0,1,2,3,4].map(i=>path(`M${100+i*30},${y+4} q3,${14+i%3*8} 0,${22+i%2*10} q-3,-8 0,-${22+i%2*10}z`,fg)).join("");break;
  case"left":s+=base(20,y+20,fg,"","start")+line(20,y+40,300,y+40,fg,1);for(let i=1;i<6;i++)s+=line(i*53,0,i*53,H,P[3],.4);break;
  case"outline":{const isP=fk==="graduate";s+=base(164,y+4,P[2])+base(160,y,isP?P[0]:P[1],`stroke="${isP?P[1]:P[3]}" stroke-width="2"`);break}
  case"stripes":{const id=uid();s+=`<defs><pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="4" fill="#151515"/></pattern></defs>`+base(160,y,`url(#${id})`,`stroke="#151515" stroke-width="1"`);break}
  case"roundel":s+=circ(160,y-size*.35,size*1.1,P[3])+circ(160,y-size*.35,size*.75,P[0])+circ(160,y-size*.35,size*.4,P[2])+base(160,y,P[1],`stroke="${P[0]}" stroke-width="3" paint-order="stroke"`);break;
  case"wave":{const id=uid();s+=`<defs><path id="${id}" d="M10,${y} C80,${y-50} 120,${y+50} 180,${y} S270,${y-40} 310,${y}"/></defs><text font-size="${f1(Math.min(size,46))}" fill="${fg}" font-family='${fam}'${wt}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(name)}</textPath></text>`;break}
  case"ransom":s+=perLetter((c,x,i)=>c===" "?"":`<g transform="rotate(${((i*37)%14)-7} ${f1(x)} ${y-size*.35})">${rect(x-size*.33,y-size*.85,size*.66,size*1.05,P[1+i%4])}<text x="${f1(x)}" y="${y}" font-size="${f1(size*.8)}" text-anchor="middle" font-family='${[F.fraunces,F.black2,F.elite,F.bangers][i%4]}' fill="${i%4===0?P[0]:P[1]}">${esc(c)}</text></g>`);break;
  case"colors":s+=perLetter((c,x,i)=>`<text x="${f1(x)}" y="${y}" font-size="${f1(size)}" text-anchor="middle" font-family='${fam}' font-weight="700" fill="${P[1+i%4]}">${esc(c)}</text>`);break;
  case"rotate":s+=perLetter((c,x,i)=>`<text x="${f1(x+((i*13)%7)-3)}" y="${f1(y+((i*29)%17)-8)}" font-size="${f1(size)}" text-anchor="middle" font-family='${fam}' font-weight="700" fill="${i%3?fg:P[3]}" transform="rotate(${((i*41)%30)-15} ${f1(x)} ${y})">${esc(c)}</text>`);break;
  case"shadow":s+=base(165,y+5,P[2])+base(160,y,P[1],`stroke="${P[4]}" stroke-width="1.5"`);break;
  case"glow":{const id=uid();s+=`<defs><filter id="${id}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="4"/></filter></defs>`+base(160,y,P[2],`filter="url(#${id})"`)+base(160,y,"#ffe6f6")+base(160,y+30,P[3],'opacity=".5"');break}
  case"distress":s+=base(160,y,fg);for(let i=0;i<70;i++)s+=rect(40+(i*53)%240,y-size+(i*29)%(size+6),2+(i%3),1+(i%2),bg);break;
  case"chrome":{const id=uid();s+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".48" stop-color="#8a94b0"/><stop offset=".52" stop-color="#3d4560"/><stop offset="1" stop-color="#e8ecf5"/></linearGradient></defs>`+base(160,y,`url(#${id})`,`stroke="${P[3]}" stroke-width="1.2"`);break}
  case"gloss":case"grad":{const id=uid(),g=o.fx==="gloss";if(!g)s=M.vapor(W,H,P,rng(1));const a=g?["#7cd0ff","#1d6fb8"]:["#ffffff",P[1]];s+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a[0]}"/><stop offset="1" stop-color="${a[1]}"/></linearGradient></defs>`+base(160,g?y:70,`url(#${id})`,g?`stroke="#ffffff" stroke-width="1"`:`stroke="${P[4]}" stroke-width=".8"`);break}
  case"emboss":s+=base(160,y+1.5,"#ffffff",'opacity=".6"')+base(160,y-1,"#000000",'opacity=".35"')+base(160,y,P[0]===bg?mix(bg,"#000",.15):P[1]);break;
  case"flourish":s+=base(160,y,fg)+path(`M60,${y+22} C100,${y+40} 130,${y+4} 160,${y+22} S220,${y+40} 260,${y+22}`,"none",stroke(P[3],2))+circ(60,y+22,3,P[3])+circ(260,y+22,3,P[3]);break;
  case"rules":s+=line(30,y-size-8,290,y-size-8,fg,2)+line(30,y+16,290,y+16,fg,2)+line(30,y-size-4,290,y-size-4,fg,.6)+line(30,y+12,290,y+12,fg,.6)+base(160,y,fg);break;
  case"star":s+=base(160,y,fg);for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=line(270,50,270+Math.cos(a)*14,50+Math.sin(a)*14,P[1],1.6)}break;
  case"enso":s+=`<svg x="90" y="30" width="140" height="140" viewBox="0 0 60 60">${M.enso(60,60,[bg,mix(bg,fg,.25),bg,bg,bg],rng(3))}</svg>`+base(160,y,fg);break;
  case"sun":s+=circ(160,y-size*.3,size*.9,P[2],'opacity=".5"')+base(160,y,P[1]);break;
  case"leaf":s+=[0,1,2,3].map(i=>path(`M${40+i*80},200 q20,-16 40,0 q-20,16 -40,0z`,i%2?P[1]:P[2])).join("")+base(160,y,fg);break;
  default:s+=base(160,y,fg)}
  s+=txt(20,28,yrs(st),12,fg,F.atk,'opacity=".7" font-weight="700"')+txt(160,198,"Aa Bb Cc Gg Rr 1234",15,fg,fam,'text-anchor="middle" opacity=".75"');
  return s+P.slice(1).map((c,i)=>circ(244+i*16,24,6,c,stroke(mix(c,"#000",.2),.8))).join("")}

/* Which interpretations each style gets */
const SCENE={
 a:{gothic:st=>BLD.cathedral(st),gothicrevival:st=>BLD.cathedral(st,{clock:1}),renaissance:st=>BLD.dome(st),baroque:st=>BLD.baroque(st),neoclassical:st=>BLD.temple(st),artnouveau:st=>BLD.nouveau(st),destijl:st=>BLD.planes(st),bauhaus:st=>BLD.bauhaus(st),artdeco:st=>BLD.tower(st),modernism:st=>BLD.box(st),midcentury:st=>BLD.ranch(st),brutalism:st=>BLD.block(st),postmodernism:st=>BLD.pomo(st),deconstructivism:st=>BLD.shard(st),parametricism:st=>BLD.wave(st),solarpunk:st=>BLD.green(st,{solar:1}),biophilic:st=>BLD.green(st)},
 i:ROOMS,f:OUT,g:POST,d:SCR};
const KIND={a:"Building",i:"Room",f:"Outfit",g:"Poster",d:"Screen"};
const ARTCACHE={};
function interps(st){if(ARTCACHE[st.id])return ARTCACHE[st.id];const out=[];for(const c of st.d){const fn=SCENE[c]&&SCENE[c][st.id];if(fn){try{out.push([KIND[c],fn(st)])}catch(e){console.error(st.id,c,e)}}}
  out.push(["Lettering",typeSpec(st)]);out.push(["Pattern",motif(st,W,H)]);return ARTCACHE[st.id]=out}
const artSVG=(svg,cls="")=>`<svg class="${cls}" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${svg}</svg>`;

/* STATE */
const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const yrs=s=>(s.y0<1900?"c. ":"")+s.y0+"–"+(s.y1>=2026?"today":s.y1);
const store={get(){try{return JSON.parse(localStorage.getItem("aesthetic-atlas-v2"))||{}}catch(e){return{}}},set(v){try{localStorage.setItem("aesthetic-atlas-v2",JSON.stringify(v))}catch(e){}}};
const prog=Object.assign({seen:{},score:{}},store.get());prog.seen=prog.seen||{};prog.score=prog.score||{};
const save=()=>store.set(prog);
const mastered=id=>(prog.score[id]||0)>=2;
const REDUCED=matchMedia("(prefers-reduced-motion: reduce)").matches;

const $=s=>document.querySelector(s);
const svg=$("#map"),world=$("#world"),nodesG=$("#nodes"),edgesG=$("#edges"),lanesG=$("#lanes"),stage=$("#stage"),sheet=$("#sheet"),learn=$("#learn");
const L={map:layoutConstellation(),time:layoutTimeline()};
let mode="map",sel=null,filter=new Set(),view={k:1,tx:0,ty:0};
const cur={};S.forEach(s=>cur[s.id]={...L.map[s.id]});

const NEI={};S.forEach(s=>NEI[s.id]=new Set());E.forEach(([a,b])=>{NEI[a].add(b);NEI[b].add(a)});

/* BUILD */
const RAYS=Array.from({length:24},(_,i)=>{const t=i/24*Math.PI*2,r1=34,r2=i%2?40:47;return`<line x1="${f1(Math.cos(t)*r1)}" y1="${f1(Math.sin(t)*r1)}" x2="${f1(Math.cos(t)*r2)}" y2="${f1(Math.sin(t)*r2)}"/>`}).join("");
function buildNodes(){
  nodesG.innerHTML=S.map(s=>`<g class="node" data-id="${s.id}" tabindex="0" role="button" aria-label="${esc(s.n)}, ${yrs(s)}"><circle class="halo" r="31"/><g clip-path="url(#nc)"><svg class="pl" x="-26" y="-26" width="52" height="52" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice">${motif(s,60,60)}</svg><image class="nphoto" x="-26" y="-26" width="52" height="52" preserveAspectRatio="xMidYMid slice"/></g><g class="rays">${RAYS}</g><circle class="ring" r="29"/><circle class="dom" cx="0" cy="29" r="3.4" style="fill:var(${DOM[s.d[0]][1]})"/><path class="star" d="M22,-31 l2.4,5 5.4,.6 -4,3.7 1.1,5.3 -4.9,-2.7 -4.9,2.7 1.1,-5.3 -4,-3.7 5.4,-.6z"/><text y="50">${esc(s.n)}</text></g>`).join("");
  edgesG.innerHTML=E.map(([a,b,t],i)=>`<path class="edge ${t}" data-i="${i}" marker-start="url(#m-dot)" ${t!=="kin"?`marker-end="url(#m-${t})"`:""}/>`).join("");
  const T=L.time,right=YX(2026)+120;let h="";
  T.lanes.forEach((ln,i)=>{h+=`<rect class="band" x="-260" y="${ln.top}" width="${right+260}" height="${ln.h}" ${i%2?'style="opacity:.25"':""}/><text class="lane-label" x="-236" y="${ln.top+44}" style="fill:var(${DOM[ln.c][1]})">${esc(DOM[ln.c][0])}</text>`});
  [1100,1300,1500,1700,1800,1900,1920,1940,1960,1980,2000,2020].forEach(y=>{h+=`<line class="tick" x1="${YX(y)}" y1="-30" x2="${YX(y)}" y2="${T.height}"/><text class="tick-label" x="${YX(y)}" y="-40">${y}</text>`});
  S.forEach(s=>{const p=T.pos[s.id];h+=`<line class="bar" x1="${YX(s.y0)}" y1="${p.y}" x2="${YX(Math.min(s.y1,2026))+ (s.y1>=2026?40:0)}" y2="${p.y}" style="stroke:var(${DOM[s.d[0]][1]})"/>`});
  lanesG.innerHTML=h;lanesG.style.opacity=0;
}
function edgePath(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,r=34;if(d<2*r+6)return"M0,0";const x1=a.x+ux*r,y1=a.y+uy*r,x2=b.x-ux*(r+3),y2=b.y-uy*(r+3),bend=Math.min(60,d*.13),mx=(x1+x2)/2-uy*bend,my=(y1+y2)/2+ux*bend;return`M${f1(x1)},${f1(y1)} Q${f1(mx)},${f1(my)} ${f1(x2)},${f1(y2)}`}
function geom(){nodesG.querySelectorAll(".node").forEach(n=>{const p=cur[n.dataset.id];n.setAttribute("transform",`translate(${f1(p.x)},${f1(p.y)})`)});edgesG.querySelectorAll(".edge").forEach(e=>{const[a,b]=E[+e.dataset.i];e.setAttribute("d",edgePath(cur[a],cur[b]))})}
function applyView(){world.setAttribute("transform",`translate(${f1(view.tx)},${f1(view.ty)}) scale(${view.k.toFixed(4)})`);bgUpdate()}
function inFilter(s){return !filter.size||[...s.d].some(c=>filter.has(c))}
function classes(){
  const nb=sel?NEI[sel]:null;
  nodesG.querySelectorAll(".node").forEach(n=>{const id=n.dataset.id,s=BY[id];n.classList.toggle("sel",id===sel);n.classList.toggle("seen",!!prog.seen[id]);n.classList.toggle("mastered",mastered(id));
    n.classList.toggle("dim",!inFilter(s)||(nb&&id!==sel&&!nb.has(id)))});
  edgesG.querySelectorAll(".edge").forEach(e=>{const[a,b]=E[+e.dataset.i],inc=sel&&(a===sel||b===sel);e.classList.toggle("hot",!!inc);e.classList.toggle("dim",(sel&&!inc)||!inFilter(BY[a])||!inFilter(BY[b])||(mode==="time"&&!inc))});
  updateProgress();
}
function updateProgress(){const seen=Object.keys(prog.seen).filter(k=>BY[k]).length,m=S.filter(s=>mastered(s.id)).length;$("#progress").textContent=`${seen} of ${S.length} explored, ${m} mastered`}

/* VIEW CONTROL */
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
let anim=null;
function animate(dur,step,done){if(anim)cancelAnimationFrame(anim);if(REDUCED||dur<=0){step(1);done&&done();return}const t0=performance.now();const tick=now=>{const t=Math.min(1,(now-t0)/dur);step(ease(t));if(t<1)anim=requestAnimationFrame(tick);else{anim=null;done&&done()}};anim=requestAnimationFrame(tick)}
function stageBox(){const r=svg.getBoundingClientRect();return{w:r.width,h:r.height,left:r.left,top:r.top}}
function focusArea(){const b=stageBox(),open=sheet.classList.contains("open");if(innerWidth>=900)return{cx:open?(b.w-430)/2:b.w/2,cy:b.h/2,w:open?b.w-430:b.w,h:b.h};const sh=open?sheet.getBoundingClientRect().height:0;return{cx:b.w/2,cy:(b.h-sh)/2,w:b.w,h:b.h-sh}}
function targetFit(){const b=stageBox(),P=Object.values(L[mode==="time"?"time":"map"].pos||L.map);
  if(mode==="time"){const T=L.time,k=b.w<700?.55:Math.max(.28,Math.min(.8,(b.h-30)/(T.height+80)));return{k,tx:b.w<700?12-YX(1840)*k:20+260*k,ty:60*k+10}}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;Object.values(L.map).forEach(p=>{x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y)});
  x0-=70;x1+=70;y0-=50;y1+=80;let k=Math.max(.2,Math.min(1.1,b.w/(x1-x0),b.h/(y1-y0)));if(b.w<700)k=Math.max(k,.58);return{k,tx:b.w/2-(x0+x1)/2*k,ty:b.h/2-(y0+y1)/2*k}}
function goView(t,dur=550){const f={...view};animate(dur,e=>{view.k=f.k+(t.k-f.k)*e;view.tx=f.tx+(t.tx-f.tx)*e;view.ty=f.ty+(t.ty-f.ty)*e;applyView()})}
function flyTo(id){const p=cur[id]||L.map[id],fa=focusArea(),k=Math.max(view.k,mode==="time"?.6:.75);goView({k,tx:fa.cx-p.x*k,ty:fa.cy-p.y*k})}

function setMode(m){
  document.querySelectorAll(".views button").forEach(b=>b.setAttribute("aria-selected",b.dataset.view===m));
  if(m==="learn"){learn.classList.add("show");renderLearn();return}
  learn.classList.remove("show");
  if(m===mode){return}
  mode=m;const target=m==="time"?L.time.pos:L.map,from={};S.forEach(s=>from[s.id]={...cur[s.id]});
  lanesG.style.opacity=m==="time"?1:0;$("#legend").style.display=m==="time"?"none":"";
  const fit=targetFit();const fv={...view};
  animate(800,e=>{S.forEach(s=>{const a=from[s.id],b=target[s.id];cur[s.id].x=a.x+(b.x-a.x)*e;cur[s.id].y=a.y+(b.y-a.y)*e});view.k=fv.k+(fit.k-fv.k)*e;view.tx=fv.tx+(fit.tx-fv.tx)*e;view.ty=fv.ty+(fit.ty-fv.ty)*e;geom();applyView()},()=>{if(sel)flyTo(sel)});
  classes();
}

/* SELECTION & SHEET */
function select(id,fly=true){
  if(!BY[id])return;sel=id;prog.seen[id]=1;save();
  if(learn.classList.contains("show"))setMode(mode);
  renderSheet(id);afterSheet(id);sheet.classList.add("open");stage.classList.add("sheet-open");sheet.scrollTop=0;
  classes();if(fly)requestAnimationFrame(()=>flyTo(id));
}
function closeSheet(){sel=null;sheet.classList.remove("open");stage.classList.remove("sheet-open");classes()}
function renderSheet(id){
  const s=BY[id];const groups={"Grew out of":[],"Fed into":[],"Reacted against":[],"Provoked":[],"Revives":[],"Revived by":[],"Kindred spirits":[]};
  E.forEach(([a,b,t,note])=>{if(a!==id&&b!==id)return;const other=a===id?b:a;const k=t==="inf"?(b===id?"Grew out of":"Fed into"):t==="rx"?(b===id?"Reacted against":"Provoked"):t==="rev"?(b===id?"Revives":"Revived by"):"Kindred spirits";groups[k].push([other,note])});
  const lineFor={"Grew out of":"inf","Fed into":"inf","Reacted against":"rx","Provoked":"rx","Revives":"rev","Revived by":"rev","Kindred spirits":"kin"};
  const conn=Object.entries(groups).filter(([,v])=>v.length).map(([k,v])=>`<div class="conn-group"><div>${legendLine(lineFor[k])}${k}</div>${v.map(([o,n])=>`<button class="go" data-go="${o}"><b>${esc(BY[o].n)}</b><small>${esc(n)}</small></button>`).join("")}</div>`).join("");
  const pairs=PAIRS.filter(p=>p[0]===id||p[1]===id);
  sheet.innerHTML=`<div class="grab"></div><div class="sheet-head"><div class="domains">${[...s.d].map(c=>`<span class="dtag" style="--c:var(${DOM[c][1]})">${esc(DOM[c][0])}</span>`).join("")}</div><button class="closebtn" data-close>Close</button></div>
  <div class="strip">${interps(s).map(([lab,svg],i)=>`<figure><button data-art="${id}|${i}" aria-label="${lab}, enlarge">${artSVG(svg)}</button><figcaption>${lab}</figcaption></figure>`).join("")}</div><p class="stripnote">Claude’s illustrated readings of the style, drawn from its rules. Swipe for more, tap to enlarge.</p>
  <h2>${esc(s.n)}</h2><p class="era">${yrs(s)}</p><p class="sum">${esc(s.s)}</p>
  <h3>Look for</h3><ul class="look">${s.look.map(l=>`<li>${esc(l)}</li>`).join("")}</ul>
  <h3>Palette</h3><div class="swatches">${s.p.map(c=>`<div class="sw"><i style="background:${c}"></i><span>${c.toUpperCase()}</span></div>`).join("")}</div>
  ${s.x?`<h3>Across fields</h3><p class="across">${esc(s.x)}</p>`:""}
  <h3>Your photo collection</h3><div id="gallery"></div><div class="findrow"><a href="${ddg(s)}" target="_blank" rel="noopener" style="--c:#de5833"><i></i>DuckDuckGo images</a><a href="${pin(s)}" target="_blank" rel="noopener" style="--c:#e60023"><i></i>Pinterest</a><a href="${commons(s.n+' '+FIELDQ[s.d[0]])}" target="_blank" rel="noopener" style="--c:#3366cc"><i></i>Wikimedia Commons</a></div><p class="galnote" style="margin-top:8px">Find an image, save it to your phone, then tap Add photo and put the photographer or site in the credit line.</p>
  <h3>See it in</h3><ul class="ex">${s.ex.map(e=>`<li><a href="${commons(e)}" target="_blank" rel="noopener">${esc(e)}</a></li>`).join("")}</ul><p class="galnote" style="margin-top:8px">Each example opens a search of Wikimedia Commons, where most photos are free to reuse.</p>
  <h3>Word to know</h3><div class="vocab"><b>${esc(s.term)}</b><span>${esc(s.def)}</span></div>
  <h3>Connections</h3>${conn}
  ${pairs.length?`<h3>Often confused with</h3>${pairs.map(p=>{const o=p[0]===id?p[1]:p[0];return`<button class="go" data-cmp="${p[0]}|${p[1]}"><b>${esc(BY[o].n)}</b><small>See how to tell them apart</small></button>`}).join("")}`:""}
  <div class="btnrow"><button class="btn" data-quiz="${id}">Test yourself on this</button><button class="btn ghost" data-close>Back to the ${mode==="time"?"timeline":"map"}</button></div>`;
}
function afterSheet(id){renderGallery(id)}
function legendLine(t){const st={inf:'style="stroke:var(--inf)" stroke-width="2"',rx:'style="stroke:var(--rx)" stroke-width="2" stroke-dasharray="6 3"',rev:'style="stroke:var(--brass)" stroke-width="3" stroke-dasharray=".5 4.5" stroke-linecap="round"',kin:'style="stroke:var(--kin)" stroke-width="2"'}[t];return`<svg width="22" height="6"><line x1="2" y1="3" x2="21" y2="3" ${st}/></svg>`}
document.addEventListener("click",e=>{
  const go=e.target.closest("[data-go]");if(go){closeCompare();if(learn.classList.contains("show"))setMode(mode);select(go.dataset.go);return}
  if(e.target.closest("[data-close]")){closeSheet();return}
  const c=e.target.closest("[data-cmp]");if(c){const[a,b]=c.dataset.cmp.split("|");openCompare(a,b);return}
  const q=e.target.closest("[data-quiz]");if(q){closeCompare();setMode("learn");nextQ(q.dataset.quiz);return}
});

/* COMPARE */
const cmp=$("#compare");
function openCompare(a,b){const p=PAIRS.find(x=>(x[0]===a&&x[1]===b)||(x[0]===b&&x[1]===a));const A=BY[a],B=BY[b];
  const col=s=>`<div><div class="plate" style="height:auto;aspect-ratio:4/3">${artSVG(interps(s)[0][1])}</div><h4>${esc(s.n)}</h4><div class="era" style="margin:0">${yrs(s)}</div><ul>${s.look.map(l=>`<li>${esc(l)}</li>`).join("")}</ul><button class="btn ghost" data-go="${s.id}">Open ${esc(s.n)}</button></div>`;
  cmp.innerHTML=`<div class="cmp"><div class="cmp-top"><div>Tell them apart</div><button class="closebtn" data-cmpclose>Close</button></div><p class="tell">${esc(p?p[2]:"")}</p><div class="cmp-cols">${col(A)}${col(B)}</div></div>`;
  cmp.classList.add("show");cmp.querySelector("[data-cmpclose]").focus();}
function closeCompare(){cmp.classList.remove("show")}
cmp.addEventListener("click",e=>{if(e.target===cmp||e.target.closest("[data-cmpclose]"))closeCompare()});
addEventListener("keydown",e=>{if(e.key==="Escape"){if(cmp.classList.contains("show"))closeCompare();else if(sel)closeSheet()}});

/* LEARN */
let Q=null,lastTarget=null;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function pickTarget(){const pool=S.filter(s=>s.id!==lastTarget);const w=pool.map(s=>(mastered(s.id)?1:prog.seen[s.id]?5:3));let t=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){t-=w[i];if(t<=0)return pool[i]}return pool[0]}
function distractors(t,n){const same=shuffle(S.filter(s=>s.id!==t.id&&[...s.d].some(c=>t.d.includes(c)))),other=shuffle(S.filter(s=>s.id!==t.id&&!same.includes(s)));return same.concat(other).slice(0,n)}
function nextQ(forceId){
  const withPh=Object.keys(PHOTOS).filter(k=>PHOTOS[k].length&&k!==lastTarget);const kinds=["identify","identify","vocab","era","reaction"];if(withPh.length)kinds.push("photo","photo");let kind=forceId?(PHOTOS[forceId]&&PHOTOS[forceId].length&&Math.random()<.5?"photo":Math.random()<.6?"identify":"vocab"):kinds[Math.floor(Math.random()*kinds.length)];
  if(kind==="photo"){const t=forceId?BY[forceId]:BY[withPh[Math.floor(Math.random()*withPh.length)]];const list=PHOTOS[t.id];const ph=list[Math.floor(Math.random()*list.length)];Q={kind,target:t,photo:ph,opts:shuffle([t,...distractors(t,3)]),answer:t.id};lastTarget=t.id;Q.done=false;renderLearn();return}
  if(kind==="era"){let a,b;do{a=pickTarget();b=S[Math.floor(Math.random()*S.length)]}while(a.id===b.id||Math.abs(a.y0-b.y0)<15);Q={kind,opts:shuffle([a,b]),answer:a.y0<b.y0?a.id:b.id,a,b}}
  else if(kind==="reaction"){const rx=E.filter(e=>e[2]==="rx");const e=rx[Math.floor(Math.random()*rx.length)];const t=BY[e[0]],by=BY[e[1]];Q={kind,target:t,by,note:e[3],opts:shuffle([t,...distractors(t,3).filter(s=>s.id!==by.id).slice(0,3)]),answer:t.id}}
  else{const t=forceId?BY[forceId]:pickTarget();const arts=interps(t).filter(a=>a[0]!=="Lettering");const art=arts[Math.floor(Math.random()*arts.length)];Q={kind,target:t,art,opts:shuffle([t,...distractors(t,3)]),answer:t.id,clues:shuffle(t.look).slice(0,Math.random()<.5?1:2)}}
  lastTarget=Q.target?Q.target.id:Q.answer;Q.done=false;renderLearn();
}
function renderLearn(){
  if(!Q)nextQ();
  const seen=Object.keys(prog.seen).filter(k=>BY[k]).length,m=S.filter(s=>mastered(s.id)).length;
  let body="";
  if(Q.kind==="identify")body=`<p class="qkind">Spot the style: ${Q.art[0].toLowerCase()}</p><div class="plate" style="height:auto;aspect-ratio:4/3">${artSVG(Q.art[1])}</div><ul class="qclues">${Q.clues.map(c=>`<li>${esc(c)}</li>`).join("")}</ul><p class="qtext">Which style is this?</p>`;
  if(Q.kind==="photo")body=`<p class="qkind">Spot it in the wild</p><div class="qphoto"><img src="/_blob/${Q.photo.asset}" alt="A photo from your collection"></div><p class="qtext" style="margin-top:12px">Which style is this?</p>`;
  if(Q.kind==="vocab")body=`<p class="qkind">Word to know</p><p class="qtext"><i>${esc(Q.target.term)}</i></p><p class="sum">${esc(Q.target.def)}</p><p class="qtext" style="font-size:19px;margin-top:14px">Which style does this term belong to?</p>`;
  if(Q.kind==="era")body=`<p class="qkind">Order of arrival</p><p class="qtext">Which came first?</p>`;
  if(Q.kind==="reaction")body=`<p class="qkind">Cause and reaction</p><p class="qtext">${esc(Q.by.n)} was, in part, a reaction against…</p>`;
  const opts=Q.opts.map(o=>Q.kind==="era"?`<button class="opt withplate" data-ans="${o.id}"><div class="plate">${plateSVG(o,240,90)}</div><span>${esc(o.n)}</span></button>`:`<button class="opt" data-ans="${o.id}">${esc(o.n)}</button>`).join("");
  learn.innerHTML=`<div class="learn-in"><h2>Field test</h2><p class="lede">Train your eye. Answer correctly twice and a style earns a brass star on the map. Styles you’ve opened but not yet mastered come up more often.</p>
  <div class="meter"><div class="track"><i class="m" style="width:${m/S.length*100}%"></i><i class="s" style="width:${Math.max(0,seen-m)/S.length*100}%"></i></div><span>${m} mastered, ${seen} explored</span></div>
  <div class="qcard">${body}<div class="opts">${opts}</div><div class="feedback" id="fb"></div></div>
  <h3>Tell them apart</h3><div class="pairs">${PAIRS.map(p=>`<button class="pair" data-cmp="${p[0]}|${p[1]}"><span class="duo">${plateSVG(BY[p[0]],40,40)}${plateSVG(BY[p[1]],40,40)}</span><span>${esc(BY[p[0]].n)} and ${esc(BY[p[1]].n)}</span></button>`).join("")}</div></div>`;
  learn.querySelectorAll("[data-ans]").forEach(b=>b.addEventListener("click",()=>answer(b.dataset.ans)));
}
function answer(id){
  if(Q.done)return;Q.done=true;const ok=id===Q.answer;
  learn.querySelectorAll("[data-ans]").forEach(b=>{b.disabled=true;if(b.dataset.ans===Q.answer)b.classList.add("right");else if(b.dataset.ans===id)b.classList.add("wrong")});
  const t=BY[Q.answer];if(Q.kind!=="era"){prog.score[t.id]=Math.max(0,(prog.score[t.id]||0)+(ok?1:-1));prog.seen[t.id]=1;save();classes()}
  let msg="";
  if(Q.kind==="photo")msg=`<strong>${ok?"Correct.":"Not quite."}</strong> That’s ${esc(t.n)}${Q.photo.caption?`: ${esc(Q.photo.caption)}`:""}. Look for: ${esc(t.look.slice(0,2).join(", ").toLowerCase())}.`;
  if(Q.kind==="identify"||Q.kind==="vocab")msg=`<strong>${ok?"Correct.":"Not quite."}</strong> That’s ${esc(t.n)}, ${yrs(t)}. ${esc(t.s)}`;
  if(Q.kind==="era"){const[a,b]=[Q.a,Q.b].sort((x,y)=>x.y0-y.y0);msg=`<strong>${ok?"Correct.":"Not quite."}</strong> ${esc(a.n)} began around ${a.y0}; ${esc(b.n)} around ${b.y0}.`}
  if(Q.kind==="reaction")msg=`<strong>${ok?"Correct.":"Not quite."}</strong> ${esc(Q.by.n)} pushed back against ${esc(t.n)}: ${esc(Q.note)}.`;
  const ms=mastered(t.id)&&ok&&Q.kind!=="era"?` <strong>${esc(t.n)} is now mastered.</strong>`:"";
  $("#fb").innerHTML=`<p style="margin:0 0 12px">${msg}${ms}</p><div class="btnrow" style="margin-top:0"><button class="btn" id="nextq">Next question</button><button class="btn ghost" data-go="${t.id}">Open ${esc(t.n)} in the atlas</button></div>`;
  $("#nextq").addEventListener("click",()=>{nextQ();learn.scrollTop=0});
  const m=S.filter(s=>mastered(s.id)).length,seen=Object.keys(prog.seen).filter(k=>BY[k]).length;learn.querySelector(".meter").innerHTML=`<div class="track"><i class="m" style="width:${m/S.length*100}%"></i><i class="s" style="width:${Math.max(0,seen-m)/S.length*100}%"></i></div><span>${m} mastered, ${seen} explored</span>`;
}

/* SEARCH & FILTER */
const qIn=$("#q"),res=$("#results");
qIn.addEventListener("input",()=>{const q=qIn.value.trim().toLowerCase();if(!q){res.classList.remove("show");return}
  const hits=S.map(s=>{let sc=0;if(s.n.toLowerCase().includes(q))sc=3;else if(s.term.toLowerCase().includes(q))sc=2;else if((s.look.join(" ")+" "+s.ex.join(" ")+" "+s.s).toLowerCase().includes(q))sc=1;return[s,sc]}).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,8);
  res.innerHTML=hits.length?hits.map(([s])=>`<button data-pick="${s.id}"><span class="serif" style="font-weight:600">${esc(s.n)}</span><span class="yr">${yrs(s)}</span></button>`).join(""):`<div class="empty">No style matches “${esc(qIn.value)}”. Try a material, a decade or a designer.</div>`;res.classList.add("show")});
res.addEventListener("click",e=>{const b=e.target.closest("[data-pick]");if(!b)return;res.classList.remove("show");qIn.value="";qIn.blur();if(learn.classList.contains("show"))setMode(mode);select(b.dataset.pick)});
qIn.addEventListener("keydown",e=>{if(e.key==="Enter"){const b=res.querySelector("[data-pick]");if(b)b.click()}});
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".searchwrap"))res.classList.remove("show")});
$("#chips").innerHTML=Object.entries(DOM).map(([c,[n,v]])=>`<button class="chip" data-c="${c}" aria-pressed="false" style="--c:var(${v})"><i></i>${esc(n)}</button>`).join("");
$("#chips").insertAdjacentHTML("beforeend",`<button class="chip" id="photochip" aria-pressed="true" style="--c:var(--brass)"><i></i>Photos on map</button>`);
$("#chips").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;if(b.id==="photochip"){showPhotos=!showPhotos;b.setAttribute("aria-pressed",showPhotos);updateNodePhotos();return}const c=b.dataset.c;filter.has(c)?filter.delete(c):filter.add(c);b.setAttribute("aria-pressed",filter.has(c));classes()});
document.querySelectorAll(".views button").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.view)));
$("#fitbtn").addEventListener("click",()=>goView(targetFit()));

/* GESTURES */
const pts=new Map();let gest=null;
const local=e=>{const b=svg.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top}};
svg.addEventListener("pointerdown",e=>{if(anim){cancelAnimationFrame(anim);anim=null}svg.setPointerCapture(e.pointerId);pts.set(e.pointerId,local(e));
  if(pts.size===1){const p=local(e),n=e.target.closest(".node");gest={type:"pan",sx:p.x,sy:p.y,tx:view.tx,ty:view.ty,moved:0,node:n?n.dataset.id:null}}
  else if(pts.size===2){const[a,b]=[...pts.values()];gest={type:"pinch",d:Math.hypot(a.x-b.x,a.y-b.y)||1,k:view.k,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,tx:view.tx,ty:view.ty,moved:99}}});
svg.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId)||!gest)return;pts.set(e.pointerId,local(e));
  if(gest.type==="pan"&&pts.size===1){const p=local(e),dx=p.x-gest.sx,dy=p.y-gest.sy;gest.moved=Math.max(gest.moved,Math.abs(dx)+Math.abs(dy));if(gest.moved>5){view.tx=gest.tx+dx;view.ty=gest.ty+dy;applyView()}}
  else if(gest.type==="pinch"&&pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,k=Math.max(.18,Math.min(2.4,gest.k*d/gest.d)),wx=(gest.mx-gest.tx)/gest.k,wy=(gest.my-gest.ty)/gest.k;view.k=k;view.tx=mx-wx*k;view.ty=my-wy*k;applyView()}});
function endPtr(e){if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
  if(gest&&gest.type==="pan"&&gest.moved<=5&&pts.size===0){if(gest.node)select(gest.node);else if(sel)closeSheet()}
  if(pts.size===1){const p=[...pts.values()][0];gest={type:"pan",sx:p.x,sy:p.y,tx:view.tx,ty:view.ty,moved:99,node:null}}else if(!pts.size)gest=null}
svg.addEventListener("pointerup",endPtr);svg.addEventListener("pointercancel",endPtr);
svg.addEventListener("wheel",e=>{e.preventDefault();const p=local(e);
  if(mode==="time"&&!e.ctrlKey&&!e.metaKey){view.tx-=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY);applyView();return}
  const k0=view.k,k=Math.max(.18,Math.min(2.4,k0*Math.exp(-e.deltaY*.0018)));view.tx=p.x-(p.x-view.tx)*k/k0;view.ty=p.y-(p.y-view.ty)*k/k0;view.k=k;applyView()},{passive:false});
nodesG.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const n=e.target.closest(".node");if(n){e.preventDefault();select(n.dataset.id)}}});
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(!sel)goView(targetFit(),0)},120)});


/* BACKGROUND: slowly turning star chart with parallax */
const bgfx=document.getElementById("bgfx"),dotsPat=document.getElementById("dots");
(function(){
  /* star dust tile */
  const R=rng(7);let d="";for(let i=0;i<46;i++){const x=R()*180,y=R()*180,r=R()<.86?.4+R()*.6:1+R()*.7;d+=`<circle class="dotfill" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" opacity="${f1(.15+R()*.55)}"/>`}
  for(let i=0;i<3;i++){const x=20+R()*140,y=20+R()*140,s=2.5+R()*2;d+=`<path class="dotfill" opacity=".6" d="M${f1(x)},${f1(y-s)} L${f1(x+s*.22)},${f1(y-s*.22)} L${f1(x+s)},${f1(y)} L${f1(x+s*.22)},${f1(y+s*.22)} L${f1(x)},${f1(y+s)} L${f1(x-s*.22)},${f1(y+s*.22)} L${f1(x-s)},${f1(y)} L${f1(x-s*.22)},${f1(y-s*.22)}Z"/>`}
  dotsPat.innerHTML=d;
  /* outer ring: ticks + numerals */
  let t="";for(let i=0;i<180;i++){const a=i/180*Math.PI*2,l=i%15===0?18:i%5===0?10:5;t+=`<line class="r" x1="${f1(Math.cos(a)*430)}" y1="${f1(Math.sin(a)*430)}" x2="${f1(Math.cos(a)*(430-l))}" y2="${f1(Math.sin(a)*(430-l))}"/>`}
  const NUM=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  const nums=NUM.map((n,i)=>{const a=i/12*Math.PI*2-Math.PI/2+Math.PI/12,x=Math.cos(a)*398,y=Math.sin(a)*398;return`<text x="${f1(x)}" y="${f1(y+4)}" text-anchor="middle" transform="rotate(${f1(a*180/Math.PI+90)} ${f1(x)} ${f1(y)})">${n}</text>`}).join("");
  let spokes="";for(let i=0;i<12;i++){const a=i/12*Math.PI*2;spokes+=`<line class="faint" x1="${f1(Math.cos(a)*120)}" y1="${f1(Math.sin(a)*120)}" x2="${f1(Math.cos(a)*380)}" y2="${f1(Math.sin(a)*380)}"/>`}
  /* inner ring: moon phases */
  let moons="";for(let i=0;i<8;i++){const a=i/8*Math.PI*2-Math.PI/2,x=Math.cos(a)*232,y=Math.sin(a)*232,off=[0,6,11,16,99,-16,-11,-6][i];
    moons+=`<circle class="moon" cx="${f1(x)}" cy="${f1(y)}" r="11"/>`+(off===99?"":`<circle class="moonshade" cx="${f1(x+(off||0))}" cy="${f1(y)}" r="${off===0?11:10.5}"/>`)+`<circle class="r" cx="${f1(x)}" cy="${f1(y)}" r="11"/>`}
  let rays="";for(let i=0;i<48;i++){const a=i/48*Math.PI*2,R2=i%6===0?190:i%2?110:150;rays+=`<line class="r2" x1="${f1(Math.cos(a)*40)}" y1="${f1(Math.sin(a)*40)}" x2="${f1(Math.cos(a)*R2)}" y2="${f1(Math.sin(a)*R2)}"/>`}
  bgfx.innerHTML=`<g id="bgpos"><g class="spin"><circle class="r" r="430"/><circle class="r" r="412"/>${t}${nums}<circle class="r" r="384"/>${spokes}<circle class="r" r="340" stroke-dasharray="1 7"/></g><g class="spin2"><circle class="r" r="262"/><circle class="r" r="204"/>${moons}<circle class="faint" r="300" stroke-dasharray="2 10"/>${rays}<circle class="r" r="40"/><circle class="r" r="30" stroke-dasharray="1 4"/></g></g>`})();
function bgUpdate(){const b=svg.getBoundingClientRect(),s=Math.max(b.width,b.height)/760;const px=b.width/2+view.tx*.08-b.width*.04,py=b.height/2+view.ty*.08;
  document.getElementById("bgpos").setAttribute("transform",`translate(${f1(px)},${f1(py)}) scale(${(s*(0.9+view.k*.15)).toFixed(3)})`);
  dotsPat.setAttribute("patternTransform",`translate(${f1((view.tx*.35)%180)},${f1((view.ty*.35)%180)})`)}


/* PHOTOS: a shared collection stored with the artifact (db rows point at uploaded assets) */
const FIELDQ={a:"architecture",i:"interior design",f:"fashion",g:"art",d:"aesthetic"};
const ddg=s=>"https://duckduckgo.com/?ia=images&iax=images&q="+encodeURIComponent(s.n+" "+FIELDQ[s.d[0]]);
const pin=s=>"https://www.pinterest.com/search/pins/?q="+encodeURIComponent(s.n+" "+FIELDQ[s.d[0]]);
const commons=q=>"https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search="+encodeURIComponent(q.replace(/[“”’]/g,""));
let DB=null,ASSETS=null,PHOTOS={},galState="wait",showPhotos=true,pending=null;
function updateNodePhotos(){nodesG.querySelectorAll(".node").forEach(n=>{const l=PHOTOS[n.dataset.id],img=n.querySelector(".nphoto");if(showPhotos&&l&&l.length){img.setAttribute("href","/_blob/"+l[l.length-1].asset);n.classList.add("hasphoto")}else{n.classList.remove("hasphoto")}})}
function renderGallery(id){const g=document.getElementById("gallery");if(!g||sel!==id)return;const list=PHOTOS[id]||[];
  if(galState==="off"){g.innerHTML=`<p class="galnote">Photo collections work when the atlas is open in Claude. Use the example links below to look up real photos meanwhile.</p>`;return}
  if(galState==="wait"){g.innerHTML=`<p class="galnote">Loading photos…</p>`;return}
  let h=list.length?"":`<p class="galnote">${ASSETS?`No photos yet. Add a building, outfit, room or poster you’ve found that shows ${esc(BY[id].n)}. Collecting your own examples is the fastest way to train your eye.`:"No photos have been added to this style yet."}</p>`;
  h+=`<div class="gal">${list.map((p,i)=>`<button class="ph" data-ph="${id}|${i}" aria-label="${esc(p.caption||"Photo")}"><img src="/_blob/${p.asset}" loading="lazy" alt="${esc(p.caption||BY[id].n)}"></button>`).join("")}${ASSETS?`<label class="addph"><b>+</b>Add photo<input type="file" accept="image/*" data-up="${id}"></label>`:""}</div><div id="upform"></div>`;
  g.innerHTML=h;}
async function shrink(file){try{const bmp=await createImageBitmap(file);const k=Math.min(1,1600/Math.max(bmp.width,bmp.height));const c=document.createElement("canvas");c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);const b=await new Promise(r=>c.toBlob(r,"image/jpeg",.86));if(b)return b}catch(e){}return file}
document.addEventListener("change",e=>{const inp=e.target.closest("[data-up]");if(!inp||!inp.files[0])return;const id=inp.dataset.up,f=inp.files[0];inp.value="";
  if(pending&&pending.url)URL.revokeObjectURL(pending.url);pending={id,file:f,url:URL.createObjectURL(f)};
  document.getElementById("upform").innerHTML=`<div class="upform"><img src="${pending.url}" alt="Preview"><input type="text" id="upcap" maxlength="140" placeholder="What is it? For example: Chrysler Building lobby"><input type="text" id="upcred" maxlength="140" placeholder="Credit: photographer, site or link"><div class="msg" id="upmsg"></div><div class="btnrow" style="margin-top:0"><button class="btn" id="upsave">Save to ${esc(BY[id].n)}</button><button class="btn ghost" id="upcancel">Cancel</button></div></div>`;
  document.getElementById("upcap").focus();
  document.getElementById("upcancel").onclick=()=>{document.getElementById("upform").innerHTML="";pending=null};
  document.getElementById("upsave").onclick=savePhoto;});
async function savePhoto(){if(!pending)return;const btn=document.getElementById("upsave"),msg=document.getElementById("upmsg");btn.disabled=true;btn.textContent="Saving…";msg.textContent="";
  try{const blob=await shrink(pending.file);const type=["image/jpeg","image/png","image/webp","image/gif"].includes(blob.type)?blob.type:"image/jpeg";const up=await ASSETS.upload(blob,{type});
    await DB.collection("photos").add({style:pending.id,asset:up.id,caption:document.getElementById("upcap").value.trim(),credit:document.getElementById("upcred").value.trim(),t:Date.now()});
    const sid=pending.id;pending=null;renderGallery(sid);}
  catch(err){const c=err&&err.code;msg.textContent=c==="too_large"?"That image is over 20 MB. Choose a smaller one.":c==="unsupported_type"?"That file type can’t be stored. Use a JPEG, PNG, WebP or GIF.":c==="quota_or_state"||c==="quota_exceeded"?"The atlas’s photo storage is full. Delete some photos to make room.":c==="rate_limited"||c==="resource_exhausted"?"Too many uploads in a row. Wait a moment, then save again.":"The photo didn’t save. Check your connection and save again.";btn.disabled=false;btn.textContent="Save to "+BY[pending.id].n}}
const lb=document.getElementById("lightbox");let lbState=null;
function openLB(id,i){lbState={id,i};drawLB();lb.classList.add("show")}
function openArt(id,i){lbState={art:1,id,i};drawLB();lb.classList.add("show")}
function drawLB(){if(lbState.art){const a=interps(BY[lbState.id]);lbState.i=(lbState.i+a.length)%a.length;const[lab,svg]=a[lbState.i];lb.innerHTML=`<div class="lb-top"><span>${esc(BY[lbState.id].n)}: ${lab}, ${lbState.i+1} of ${a.length}</span><button data-lb="close">Close</button></div><div class="lb-img"><div class="lb-art">${artSVG(svg)}</div></div><p class="lb-cap">${lab==="Lettering"?"Lettering in the spirit of the style":lab==="Pattern"?"The style reduced to a pattern":`A ${lab.toLowerCase()} imagined in this style`}<small>Illustration by Claude, not a real example</small></p><div class="lb-nav"><button data-lb="prev">Previous</button><button data-lb="next">Next</button></div>`;return}
  const list=PHOTOS[lbState.id]||[];if(!list.length){lb.classList.remove("show");return}lbState.i=(lbState.i+list.length)%list.length;const p=list[lbState.i];
  lb.innerHTML=`<div class="lb-top"><span>${esc(BY[lbState.id].n)}, ${lbState.i+1} of ${list.length}</span><button data-lb="close">Close</button></div><div class="lb-img"><img src="/_blob/${p.asset}" alt="${esc(p.caption||BY[lbState.id].n)}"></div><p class="lb-cap">${esc(p.caption||"Untitled photo")}${p.credit?`<small>${esc(p.credit)}</small>`:""}</p><div class="lb-nav">${list.length>1?`<button data-lb="prev">Previous</button><button data-lb="next">Next</button>`:""}${ASSETS?`<button class="lb-del" data-lb="del">Delete photo</button>`:""}</div>`}
lb.addEventListener("click",async e=>{const b=e.target.closest("[data-lb]");if(!b){if(e.target===lb)lb.classList.remove("show");return}const a=b.dataset.lb;
  if(a==="close")lb.classList.remove("show");if(a==="prev"){lbState.i--;drawLB()}if(a==="next"){lbState.i++;drawLB()}
  if(a==="del"&&!lbState.art){const p=PHOTOS[lbState.id][lbState.i];if(!confirm("Delete this photo from the atlas? This can’t be undone."))return;b.disabled=true;try{await DB.collection("photos").doc(p.id).delete();await ASSETS.delete(p.asset)}catch(err){b.disabled=false;b.textContent="Couldn’t delete, try again"}}});
addEventListener("keydown",e=>{if(!lb.classList.contains("show"))return;if(e.key==="Escape")lb.classList.remove("show");if(e.key==="ArrowRight"){lbState.i++;drawLB()}if(e.key==="ArrowLeft"){lbState.i--;drawLB()}});
document.addEventListener("click",e=>{const ar=e.target.closest("[data-art]");if(ar){const[id,i]=ar.dataset.art.split("|");openArt(id,+i);return}const b=e.target.closest("[data-ph]");if(!b)return;const[id,i]=b.dataset.ph.split("|");openLB(id,+i)});
(async()=>{const c=window.claude;if(!c||!c.use){galState="off";if(sel)renderGallery(sel);return}
  try{DB=await c.use("db")}catch(e){DB=null}
  if(!DB){galState="off";if(sel)renderGallery(sel);return}
  try{ASSETS=await c.use("assets")}catch(e){ASSETS=null}
  DB.collection("photos").onSnapshot(snap=>{PHOTOS={};snap.docs.forEach(d=>{const v=d.data();if(!v||!BY[v.style]||!v.asset)return;(PHOTOS[v.style]=PHOTOS[v.style]||[]).push({id:d.id,...v})});Object.values(PHOTOS).forEach(a=>a.sort((x,y)=>(x.t||0)-(y.t||0)));
    galState="on";updateNodePhotos();if(sel){const g=document.getElementById("gallery");if(!g||!g.querySelector("#upform")||!document.getElementById("upform").innerHTML)renderGallery(sel)}if(lb.classList.contains("show")&&!lbState.art)drawLB()},
   ()=>{galState="off";if(sel)renderGallery(sel)});
})();

/* START */
buildNodes();geom();classes();
requestAnimationFrame(()=>{const f=targetFit();view={...f,k:f.k*.86,tx:f.tx,ty:f.ty};applyView();goView(f,REDUCED?0:900)});
