(()=>{
'use strict';
// China-friendly public market fallback: OKX -> Gate.io -> MEXC.
// No API key is required for these public ticker endpoints.
const KEY='ethCnMarketV1';
const SOURCES=[
 {name:'OKX',url:'https://www.okx.com/api/v5/market/ticker?instId=ETH-USDT',parse:j=>{const x=j?.data?.[0];return x?{p:+x.last,open:+x.open24h,high:+x.high24h,low:+x.low24h,vol:+x.vol24h}:null}},
 {name:'Gate',url:'https://api.gateio.ws/api/v4/spot/tickers?currency_pair=ETH_USDT',parse:j=>{const x=Array.isArray(j)?j[0]:null;return x?{p:+x.last,open:+x.change_percentage? +x.last/(1+(+x.change_percentage/100)): +x.last,high:+x.high_24h,low:+x.low_24h,vol:+x.quote_volume}:null}},
 {name:'MEXC',url:'https://api.mexc.com/api/v3/ticker/24hr?symbol=ETHUSDT',parse:j=>j?{p:+j.lastPrice,open:+j.openPrice,high:+j.highPrice,low:+j.lowPrice,vol:+j.quoteVolume}:null}
];
const $=s=>document.querySelector(s),fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
function paint(d,source,ms){if(!d||!isFinite(d.p)||d.p<=0)return;const prev=+(localStorage.getItem(KEY+'_p')||0);localStorage.setItem(KEY+'_p',d.p);localStorage.setItem(KEY+'_data',JSON.stringify({...d,t:Date.now(),source}));
 const price=$('#price'),chg=$('#chg'),high=$('#high'),low=$('#low'),vol=$('#vol'),cny=$('#cny'),mid=$('#mid'),wsState=$('#wsState'),dot=$('#dot'),src=$('#source'),lat=$('#lat');
 if(price)price.textContent='$'+fmt(d.p);const pct=d.open?(d.p/d.open-1)*100:0;if(chg){chg.textContent=(pct>=0?'▲ +':'▼ ')+pct.toFixed(2)+'% · '+source;chg.className='chg '+(pct>=0?'up':'down')};if(high)high.textContent='$'+fmt(d.high);if(low)low.textContent='$'+fmt(d.low);if(vol)vol.textContent=fmt(d.vol);if(cny)cny.textContent='¥'+fmt(d.p*7.12);if(mid)mid.textContent='$'+fmt(d.p);if(wsState){wsState.textContent=source+' LIVE';wsState.className='up'}if(dot)dot.className='dot live';if(src)src.textContent=source+' 实时';if(lat)lat.textContent=ms+'ms';
 const s1=d.p*.985,s2=d.p*.965,r1=d.p*1.015,r2=d.p*1.035;['s1','s2','r1','r2'].forEach((id,i)=>{const e=$('#'+id);if(e)e.textContent='$'+fmt([s1,s2,r1,r2][i])});
 if(prev&&Math.abs(d.p-prev)/prev>.01){try{if(navigator.vibrate)navigator.vibrate(80)}catch(e){}}
}
function cached(){try{const d=JSON.parse(localStorage.getItem(KEY+'_data'));if(d&&Date.now()-d.t<86400000)paint(d,d.source+' 缓存','—')}catch(e){}}
async function poll(){let best=null;const start=performance.now();for(const s of SOURCES){try{const c=new AbortController(),timer=setTimeout(()=>c.abort(),2200);const r=await fetch(s.url,{cache:'no-store',signal:c.signal,headers:{accept:'application/json'}});clearTimeout(timer);if(!r.ok)continue;const d=s.parse(await r.json());if(d&&d.p){best={d,source:s.name,ms:Math.round(performance.now()-start)};break}}catch(e){}}
 if(best)paint(best.d,best.source,best.ms);else{const e=$('#source'),d=$('#dot');if(e)e.textContent='等待行情源';if(d)d.className='dot';}
}
cached();
// Staggered polling keeps mobile CPU/network use low while recovering quickly.
setTimeout(poll,80);setInterval(poll,5000);
})();
