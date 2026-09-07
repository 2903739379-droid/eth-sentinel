(()=>{
const S=document.querySelector('.bottom');
if(!S)return;
const box=(title,body)=>{const e=document.createElement('section');e.className='p box';e.innerHTML='<b>'+title+'</b>'+body;return e};
S.insertBefore(box('衍生品监控','<div class="levels"><div class="level"><span>未平仓量 OI</span><b id="oi">—</b></div><div class="level"><span>资金费率</span><b id="funding">—</b></div><div class="level"><span>资金费率方向</span><b id="fundingDir">—</b></div><div class="level"><span>多空温度</span><b id="lsratio">—</b></div></div>'),S.children[1]);
const radar=box('全球资产热力','<div class="heat" id="globalHeat"><div><span class="muted">BTC</span><b>—</b></div><div><span class="muted">ETH</span><b>—</b></div><div><span class="muted">SOL</span><b>—</b></div><div><span class="muted">黄金</span><b>—</b></div><div><span class="muted">BTC OI</span><b>—</b></div><div><span class="muted">ETH OI</span><b>—</b></div></div><div class="muted">OKX：加密资产实时；传统市场指标需接入独立行情源。</div>');
S.insertBefore(radar,S.children[2]);
const ind=box('技术指标','<div class="levels"><div class="level"><span>RSI(14)</span><b id="rsi">—</b></div><div class="level"><span>EMA20 / EMA50</span><b id="ema">—</b></div><div class="level"><span>MACD</span><b id="macd">—</b></div><div class="level"><span>ATR(14)</span><b id="atr">—</b></div></div>');
S.appendChild(ind);
const li=box('异常雷达','<div id="anomaly" class="ai">扫描中…</div>');document.querySelector('.cards').appendChild(li);
const esc=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:2});
async function jget(u){try{const r=await fetch(u);return await r.json()}catch{return null}}
async function derivatives(inst){
 const [oi,fr,ls]=await Promise.all([
  jget('https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId='+inst+'-SWAP'),
  jget('https://www.okx.com/api/v5/public/funding-rate?instId='+inst+'-SWAP'),
  jget('https://www.okx.com/api/v5/public/position-tiers?instType=SWAP&instFamily='+inst)
 ]);
 if(oi?.data?.[0]) $('#oi').textContent=esc(oi.data[0].oi)+' '+(oi.data[0].oiCcy||'');
 if(fr?.data?.[0]){const f=+fr.data[0].fundingRate*100;$('#funding').textContent=(f>=0?'+':'')+f.toFixed(4)+'%';$('#funding').className=f>0?'up':f<0?'down':'gold';$('#fundingDir').textContent=f>0?'多头付费':'空头付费'}
 const ratio=await jget('https://www.okx.com/api/v5/rubik/stat/contracts-long-short-account-ratio?ccy='+inst+'&period=5m');
 if(ratio?.data?.length){const x=ratio.data[0];const v=+(x.longShortRatio||x[1]||0);if(v)$('#lsratio').textContent=v.toFixed(2)+' 多/空'}
}
async function heat(){
 const syms=['BTC-USDT','ETH-USDT','SOL-USDT','XAUT-USDT'];
 const out=await Promise.all(syms.map(s=>jget('https://www.okx.com/api/v5/market/ticker?instId='+s)));
 document.querySelectorAll('#globalHeat b').forEach((e,i)=>{const d=out[i]?.data?.[0];if(d)e.textContent=((+d.last-+d.open24h)/+d.open24h*100).toFixed(2)+'%'});
 const oi=await Promise.all(['BTC-USDT','ETH-USDT'].map(s=>jget('https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId='+s+'-SWAP')));
 [4,5].forEach((i,k)=>{const d=oi[k]?.data?.[0];if(d)document.querySelectorAll('#globalHeat b')[i].textContent=Number(d.oi).toLocaleString('en-US',{maximumFractionDigits:0})});
}
async function indicators(){
 const r=await jget(`https://www.okx.com/api/v5/market/candles?instId=${sym}&bar=1H&limit=100`);if(r?.code!=='0'||!r.data)return;
 const c=r.data.reverse().map(x=>({o:+x[1],h:+x[2],l:+x[3],c:+x[4]})),cl=c.map(x=>x.c),ema=(n)=>{let a=2/(n+1),v=cl[0];for(let i=1;i<cl.length;i++)v=cl[i]*a+v*(1-a);return v};
 const e20=ema(20),e50=ema(50),d=cl.map((v,i)=>i?v-cl[i-1]:0),g=d.map(v=>Math.max(v,0)),l=d.map(v=>Math.max(-v,0)),avg=a=>a.slice(-14).reduce((x,y)=>x+y,0)/14,ag=avg(g),al=avg(l),rsi=100-(100/(1+ag/(al||1e-9))),tr=c.map((x,i)=>i?Math.max(x.h-x.l,Math.abs(x.h-c[i-1].c),Math.abs(x.l-c[i-1].c)):x.h-x.l),atr=avg(tr),fast=ema(12),slow=ema(26),macd=fast-slow;
 $('#rsi').textContent=rsi.toFixed(1);$('#rsi').className=rsi>70?'down':rsi<30?'up':'gold';$('#ema').textContent=esc(e20)+' / '+esc(e50);$('#macd').textContent=(macd>=0?'+':'')+esc(macd);$('#atr').textContent=esc(atr);
 const alerts=[];if(rsi>70)alerts.push('RSI 超买');if(rsi<30)alerts.push('RSI 超卖');if(Math.abs(macd)>atr*.5)alerts.push('MACD 动量显著');if(cur.c&&Math.abs(cur.c)>4)alerts.push('24H 波动超过 4%');$('#anomaly').innerHTML=alerts.length?'<b>'+alerts.join(' · ')+'</b><br><span class="muted">检测到需要重点关注的市场状态。</span>':'<b>未发现明显异常</b><br><span class="muted">继续监控波动、资金费率与 OI。</span>';
}
async function v2(){const inst=sym.split('-')[0];if(['BTC','ETH','SOL'].includes(inst))await derivatives(inst);await heat();await indicators()}
v2();setInterval(v2,30000);
})();