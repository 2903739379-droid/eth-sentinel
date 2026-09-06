(()=>{'use strict';
const CACHE='ethFastMarketV1';
const read=()=>{try{return JSON.parse(localStorage.getItem(CACHE)||'null')}catch{return null}};
const save=x=>{try{localStorage.setItem(CACHE,JSON.stringify(x))}catch{}};
const text=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
const num=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
const apply=d=>{if(!d||!d.price)return;const p=Number(d.price);text('price','$'+num(p));text('high',d.high?num(d.high):'—');text('low',d.low?num(d.low):'—');text('vol',d.vol?num(d.vol):'—');text('cny','¥'+num(p*7.12));text('mid',num(p));const ch=Number(d.change||0),c=document.getElementById('chg');if(c){c.textContent=(ch>=0?'▲ +':'▼ ')+ch.toFixed(2)+'%';c.className='chg '+(ch>=0?'up':'down')}text('source',d.source||'FAST');text('wsState',d.source||'FAST');const dot=document.getElementById('dot');if(dot)dot.className='dot live'};
const timeout=(p,ms=3500)=>Promise.race([fetch(p,{cache:'no-store'}),new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
async function binance(){const r=await timeout('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT');if(!r.ok)throw 0;const x=await r.json();return {price:+x.lastPrice,high:+x.highPrice,low:+x.lowPrice,vol:+x.quoteVolume,change:+x.priceChangePercent,source:'Binance FAST'}}
async function coinbase(){const [p,t]=await Promise.all([timeout('https://api.coinbase.com/v2/prices/ETH-USD/spot'),timeout('https://api.exchange.coinbase.com/products/ETH-USD/ticker')]);if(!p.ok||!t.ok)throw 0;const x=await p.json(),y=await t.json();return {price:+x.data.amount,source:'Coinbase FAST',change:0,high:0,low:0,vol:+(y.volume||0)}}
async function boot(){const cached=read();if(cached)apply(cached);const jobs=[binance(),coinbase()];for(const job of jobs){try{const d=await job;save({...d,ts:Date.now()});apply(d);return}catch{}}const dot=document.getElementById('dot');if(dot)dot.className='dot off';text('source',cached?'缓存':'离线');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
