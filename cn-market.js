(()=>{
'use strict';
// OKX-only ETH market monitor. Public API, no key required.
const KEY='ethOkxMarketV1';
const TICKER='https://www.okx.com/api/v5/market/ticker?instId=ETH-USDT';
const $=s=>document.querySelector(s),fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
function paint(d,source='OKX',ms='—'){
 if(!d||!isFinite(d.p)||d.p<=0)return;
 const prev=+(localStorage.getItem(KEY+'_p')||0);localStorage.setItem(KEY+'_p',d.p);localStorage.setItem(KEY+'_data',JSON.stringify({...d,t:Date.now()}));
 const price=$('#price'),chg=$('#chg'),high=$('#high'),low=$('#low'),vol=$('#vol'),cny=$('#cny'),mid=$('#mid'),wsState=$('#wsState'),dot=$('#dot'),src=$('#source'),lat=$('#lat');
 if(price)price.textContent='$'+fmt(d.p);
 const pct=d.open?(d.p/d.open-1)*100:0;
 if(chg){chg.textContent=(pct>=0?'▲ +':'▼ ')+pct.toFixed(2)+'% · OKX';chg.className='chg '+(pct>=0?'up':'down')}
 if(high)high.textContent='$'+fmt(d.high);if(low)low.textContent='$'+fmt(d.low);if(vol)vol.textContent=fmt(d.vol);if(cny)cny.textContent='¥'+fmt(d.p*7.12);if(mid)mid.textContent='$'+fmt(d.p);
 if(wsState){wsState.textContent='OKX LIVE';wsState.className='up'}if(dot)dot.className='dot live';if(src)src.textContent='OKX 实时';if(lat)lat.textContent=ms+'ms';
 const s1=d.p*.985,s2=d.p*.965,r1=d.p*1.015,r2=d.p*1.035;['s1','s2','r1','r2'].forEach((id,i)=>{const e=$('#'+id);if(e)e.textContent='$'+fmt([s1,s2,r1,r2][i])});
 if(prev&&Math.abs(d.p-prev)/prev>.01){try{if(navigator.vibrate)navigator.vibrate(80)}catch(e){}}
}
function cached(){try{const d=JSON.parse(localStorage.getItem(KEY+'_data'));if(d&&Date.now()-d.t<86400000)paint(d,'OKX 缓存','—')}catch(e){}}
async function poll(){const start=performance.now();try{const c=new AbortController(),timer=setTimeout(()=>c.abort(),3000);const r=await fetch(TICKER,{cache:'no-store',signal:c.signal,headers:{accept:'application/json'}});clearTimeout(timer);if(!r.ok)throw Error('HTTP '+r.status);const x=(await r.json())?.data?.[0];if(!x||!x.last)throw Error('invalid');paint({p:+x.last,open:+x.open24h,high:+x.high24h,low:+x.low24h,vol:+x.vol24h},'OKX',Math.round(performance.now()-start))}catch(e){const el=$('#source'),dot=$('#dot');if(el)el.textContent='OKX 连接中';if(dot)dot.className='dot'}}
cached();setTimeout(poll,60);setInterval(poll,5000);
})();
