// Graphics live in assets/. Pictures marked data-inline (logo, stickers, bottles) are
// swapped for their SVG code so the page's CSS can animate their parts and use the web fonts.
// If that's not possible (e.g. opened straight from disk), the plain <img> stays as a fallback.
(function(){
  var imgs=[].slice.call(document.querySelectorAll('img[data-inline]'));
  if(!imgs.length||!window.fetch||!window.DOMParser||location.protocol==='file:') return;
  var n=0;
  Promise.all(imgs.map(function(img){
    var url=new URL(img.getAttribute('src'),location.href).href;
    return fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}).then(function(txt){
      var pre='a'+(++n)+'-';
      // give ids a unique prefix, so the same file can be used twice on the page
      (txt.match(/\sid="[^"]+"/g)||[]).forEach(function(m){
        var id=m.slice(5,-1).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        txt=txt.replace(new RegExp('(id="|#)'+id+'(?=["\')\\s])','g'),'$1'+pre+m.slice(5,-1));
      });
      var doc=new DOMParser().parseFromString(txt,'image/svg+xml'), svg=doc.documentElement;
      if(svg.nodeName!=='svg'||doc.getElementsByTagName('parsererror').length) return;
      [].forEach.call(svg.querySelectorAll('image'),function(im){
        ['href','xlink:href'].forEach(function(a){var v=im.getAttribute(a);if(v&&!/^(#|data:|https?:)/.test(v))im.setAttribute(a,new URL(v,url).href)});
      });
      svg.removeAttribute('width');svg.removeAttribute('height');
      svg.setAttribute('class',(img.className+' '+(svg.getAttribute('class')||'')).trim());
      if(img.alt){svg.setAttribute('role','img');svg.setAttribute('aria-label',img.alt)}else svg.setAttribute('aria-hidden','true');
      img.replaceWith(document.importNode(svg,true));
    }).catch(function(){});
  })).then(function(){
    // restart the swap scene and its step list together so they stay in sync
    if(document.getAnimations) document.getAnimations().forEach(function(a){
      var t=a.effect&&a.effect.target; if(t&&t.closest&&t.closest('.scene,.steps')) a.currentTime=0;
    });
  });
})();

(function(){
var root=document.documentElement; root.classList.add('js');
var track=document.querySelector('.track'), panels=[].slice.call(document.querySelectorAll('.panel'));
var rope=document.querySelector('.rope'), ropeLine=rope.querySelector('line');
var rider=document.querySelector('.yo-rider'), riderDisc=rider.querySelector('.disc'), dots=document.querySelector('.dots');
var reduce=matchMedia('(prefers-reduced-motion: reduce)');
var n=panels.length, W,H,stepX,stepY,cw,ch,per,diag=false,cur=0,target=0,last=-1;
panels.forEach(function(p,i){var b=document.createElement('button');b.setAttribute('aria-label','Go to '+(p.dataset.name||('section '+(i+1))));b.onclick=function(){go(i)};dots.appendChild(b);});
var dotBtns=[].slice.call(dots.children);
function go(i){ if(diag){window.scrollTo({top:i*per,behavior:'smooth'})} else {panels[i].scrollIntoView({behavior:'smooth',block:'start'})} }
[].forEach.call(document.querySelectorAll('[data-go]'),function(a){a.addEventListener('click',function(e){e.preventDefault();go(+a.dataset.go)})});
function layout(){
  W=innerWidth;H=innerHeight; diag=W>=960&&H>=600&&!reduce.matches;
  root.classList.toggle('diag',diag);
  if(!diag){panels.forEach(function(p){p.style.cssText='';p.firstElementChild.style.opacity=''});track.style.transform='';document.body.style.height='';io();return;}
  cw=Math.min(1240,W*0.86); ch=Math.min(820,H*0.84); stepX=W*0.6; stepY=H*1.02; per=H*1.15;
  panels.forEach(function(p,i){p.style.width=cw+'px';p.style.height=ch+'px';p.style.left=(i*stepX-cw/2)+'px';p.style.top=(i*stepY-ch/2)+'px';});
  document.body.style.height=((n-1)*per+H)+'px';
  var x0=-1.2*stepX, y0=-1.2*stepY, x1=(n-1+1.2)*stepX, y1=(n-1+1.2)*stepY;
  rope.style.left=x0+'px';rope.style.top=y0+'px';rope.setAttribute('width',x1-x0);rope.setAttribute('height',y1-y0);
  rope.setAttribute('viewBox','0 0 '+(x1-x0)+' '+(y1-y0));
  ropeLine.setAttribute('x1',0);ropeLine.setAttribute('y1',0);ropeLine.setAttribute('x2',x1-x0);ropeLine.setAttribute('y2',y1-y0);
  target=cur=Math.min(n-1,scrollY/per);
}
function io(){ panels.forEach(function(p){p.classList.add('on')}); }
function frame(){
  if(diag){
    target=Math.max(0,Math.min(n-1,scrollY/per));
    cur+= (target-cur)*0.085; if(Math.abs(target-cur)<0.0005) cur=target;
    var cx=cur*stepX, cy=cur*stepY;
    track.style.transform='translate3d('+(W/2-cx)+'px,'+(H/2-cy)+'px,0)';
    panels.forEach(function(p,i){
      var d=Math.min(1.4,Math.abs(cur-i)), s=1-0.07*Math.min(d,1), r=(i%2?1:-1)*(0.6+d*2.2);
      p.style.transform='scale('+s+') rotate('+r+'deg)'; p.firstElementChild.style.opacity=(1-0.55*Math.min(d,1)).toFixed(3);
      p.classList.toggle('on',d<0.55);
    });
    var t=0.42, rx=W/2+t*stepX, ry=H/2+t*stepY*0.92;
    if(ry>H-46){ry=H-46;rx=W/2+(ry-H/2)/stepY*stepX;}
    rider.style.left=rx+'px';rider.style.top=ry+'px';
    riderDisc.style.transform='rotate('+(cur*420)+'deg)';
    var k=Math.round(cur); if(k!==last){dotBtns.forEach(function(b,i){b.classList.toggle('on',i===k)});last=k;}
  }
  requestAnimationFrame(frame);
}
if('IntersectionObserver' in window){
  var ob=new IntersectionObserver(function(es){es.forEach(function(e){if(!diag&&e.isIntersecting)e.target.classList.add('on')})},{threshold:.18});
  panels.forEach(function(p){ob.observe(p)});
} else io();
addEventListener('resize',layout); reduce.addEventListener&&reduce.addEventListener('change',layout);
layout(); requestAnimationFrame(frame);
})();
