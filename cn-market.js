(()=>{
'use strict';
// OKX market monitor + long/short advice, risk metrics and email alert UI.
const KEY='ethOkxMarketV1';
const TICKER='https://www.okx.com/api/v5/market/ticker?instId=ETH-USDT';
const $=s=>document.querySelector(s),fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
let latest=null;

function ensurePanels(){
 if(document.getElementById('gs-extra'))return;
 const style=document.createElement('style');
 style.textContent=`#gs-extra{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:14px;margin-top:14px}.gs-card{background:#0d131b;border:1px solid #202b38;border-radius:13px;overflow:hidden;color:#edf3f9}.gs-hd{height:46px;padding:0 13px;border-bottom:1px solid #202b38;display:flex;align-items:center;justify-content:space-between;font-weight:750;font-size:12px}.gs-body{padding:13px}.gs-big{font-size:25px;font-weight:850;margin:3px 0 8px}.gs-up{color:#22d3a0}.gs-down{color:#ff5d70}.gs-gold{color:#e8b957}.gs-muted{color:#8190a3;font-size:9px}.gs-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.gs-item{border:1px solid #192532;background:#090e14;border-radius:8px;padding:9px}.gs-item span{display:block;color:#8190a3;font-size:9px}.gs-item b{display:block;font-size:14px;margin-top:5px}.gs-input{width:100%;height:34px;background:#0b1017;color:#edf3f9;border:1px solid #202b38;border-radius:8px;padding:0 9px;margin-top:7px;box-sizing:border-box}.gs-row{display:flex;gap:6px}.gs-btn{height:34px;border:1px solid #405064;background:#142031;color:#edf3f9;border-radius:8px;padding:0 10px;cursor:pointer}.gs-btn:hover{background:#1b2b40}.gs-note{line-height:1.6;color:#8190a3;font-size:10px;margin-top:8px}.gs-close{cursor:pointer;color:#8190a3}.gs-ok{font-size:10px;margin-top:7px}.gs-riskbar{height:7px;background:linear-gradient(90deg,#22d3a0,#e8b957,#ff5d70);border-radius:8px;margin:8px 0}.gs-pill{display:inline-block;padding:3px 7px;border:1px solid #405064;border-radius:5px;font-size:9px}@media(max-width:1000px){#gs-extra{grid-template-columns:1fr 1fr}}@media(max-width:650px){#gs-extra{grid-template-columns:1fr}}`;
 document.head.appendChild(style);
 const anchor=document.querySelector('.bottom');
 if(!anchor)return;
 const wrap=document.createElement('div');wrap.id='gs-extra';
 wrap.innerHTML=`<section class="gs-card"><div class="gs-hd">多空建议 <span id="gs-advice-pill" class="gs-pill">计算中</span></div><div class="gs-body"><div id="gs-advice" class="gs-big">等待实时行情…</div><div id="gs-advice-text" class="gs-note">基于价格动量、市场情绪和波动风险进行规则化判断。</div><div class="gs-riskbar"><i id="gs-advice-needle" style="display:block;width:50%;height:7px;background:rgba(255,255,255,.8);border-radius:8px"></i></div><div class="gs-note">仅供研究参考，不构成投资建议。</div></div></section>
 <section class="gs-card"><div class="gs-hd">风险指标 <span class="gs-muted">实时计算</span></div><div class="gs-body"><div class="gs-grid"><div class="gs-item"><span>综合风险</span><b id="gs-risk">—</b></div><div class="gs-item"><span>24H波动</span><b id="gs-vol">—</b></div><div class="gs-item"><span>距离24H高点</span><b id="gs-highdist">—</b></div><div class="gs-item"><span>距离24H低点</span><b id="gs-lowdist">—</b></div><div class="gs-item"><span>止损参考</span><b id="gs-stop">—</b></div><div class="gs-item"><span>仓位建议</span><b id="gs-size">—</b></div></div></div></section>
 <section class="gs-card" id="gs-email"><div class="gs-hd">邮箱价格预警 <span class="gs-close" id="gs-email-toggle">收起</span></div><div class="gs-body" id="gs-email-body"><div class="gs-muted">配置后保存在本浏览器；真正发信仍由 GitHub Actions + SMTP 完成。</div><input id="gs-email-to" class="gs-input" type="email" placeholder="接收邮箱，例如 name@example.com"><div class="gs-row"><input id="gs-email-price" class="gs-input" type="number" step="any" placeholder="触发价格"><select id="gs-email-dir" class="gs-input"><option value="above">突破上方</option><option value="below">跌破下方</option></select></div><button id="gs-email-save" class="gs-btn" style="width:100%;margin-top:8px">保存邮箱预警</button><div id="gs-email-msg" class="gs-ok"></div><div class="gs-note">提示：GitHub Pages 无法安全保存 SMTP 密码。若要实际自动发邮件，请在仓库 Variables/Secrets 中配置 ALERT_SYMBOL、ALERT_PRICE、ALERT_DIRECTION 和 SMTP 参数。</div></div></section>`;
 anchor.parentNode.insertBefore(wrap,anchor);
 const saved=JSON.parse(localStorage.getItem('gs-email-alert')||'null');
 if(saved){$('#gs-email-to').value=saved.to||'';$('#gs-email-price').value=saved.price||'';$('#gs-email-dir').value=saved.dir||'above';$('#gs-email-msg').textContent='已载入本机配置 · '+saved.to}
 $('#gs-email-save').onclick=()=>{const to=$('#gs-email-to').value.trim(),price=+$('#gs-email-price').value,dir=$('#gs-email-dir').value;if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)||!price){$('#gs-email-msg').textContent='请填写有效邮箱和触发价格';$('#gs-email-msg').className='gs-ok gs-down';return}localStorage.setItem('gs-email-alert',JSON.stringify({to,price,dir,symbol:'ETH-USDT'}));$('#gs-email-msg').textContent='已保存：'+to+' · '+(dir==='above'?'≥':'≤')+' $'+fmt(price);$('#gs-email-msg').className='gs-ok gs-up'};
 $('#gs-email-toggle').onclick=()=>{$('#gs-email-body').style.display=$('#gs-email-body').style.display==='none'?'block':'none';$('#gs-email-toggle').textContent=$('#gs-email-body').style.display==='none'?'展开':'收起'};
}

function paintAdvice(d){
 if(!d||!isFinite(d.p)||d.p<=0)return;
 latest=d;
 const c=d.open?(d.p/d.open-1)*100:0, range=d.low&&d.high?Math.max(.0001,(d.high-d.low)/d.p*100):Math.abs(c)*1.5;
 const fng=+(document.getElementById('fear')?.textContent||50)||50;
 const score=Math.max(0,Math.min(100,50+c*4+(fng-50)*.45));
 const risk=Math.max(0,Math.min(100,Math.abs(c)*10+range*7+(Math.abs(score-50)*.35)));
 const advice=score>=68?'偏多 · 等待回踩确认':score<=32?'偏空 · 反弹承压优先':'震荡 · 等待方向突破';
 const a=$('#gs-advice'),pill=$('#gs-advice-pill');
 if(a){a.textContent=advice;a.className='gs-big '+(score>=68?'gs-up':score<=32?'gs-down':'gs-gold')}
 if(pill){pill.textContent=score>=68?'LONG':score<=32?'SHORT':'NEUTRAL';pill.className='gs-pill '+(score>=68?'gs-up':score<=32?'gs-down':'gs-gold')}
 const text=$('#gs-advice-text');if(text)text.textContent=`24H ${c>=0?'+':''}${c.toFixed(2)}% · 情绪 ${Math.round(score)}/100。${score>=68?'多头占优，但高位追涨风险上升。':score<=32?'空头占优，但急跌后注意反弹风险。':'多空信号不强，优先等待突破并控制仓位。'}`;
 const needle=$('#gs-advice-needle');if(needle)needle.style.width=score+'%';
 const r=$('#gs-risk');if(r){r.textContent=risk>=70?'高':risk>=45?'中':'低';r.className=risk>=70?'gs-down':risk>=45?'gs-gold':'gs-up'}
 $('#gs-vol').textContent=range.toFixed(2)+'%';
 $('#gs-highdist').textContent=((d.p/d.high-1)*100).toFixed(2)+'%';
 $('#gs-lowdist').textContent=((d.p/d.low-1)*100).toFixed(2)+'%';
 $('#gs-stop').textContent='$'+fmt(d.p*(score>=68?.975:.975));
 $('#gs-size').textContent=risk>=70?'轻仓':risk>=45?'中仓':'正常';
}

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
 paintAdvice(d);
 if(prev&&Math.abs(d.p-prev)/prev>.01){try{if(navigator.vibrate)navigator.vibrate(80)}catch(e){}}
}
function cached(){try{const d=JSON.parse(localStorage.getItem(KEY+'_data'));if(d&&Date.now()-d.t<86400000)paint(d,'OKX 缓存','—')}catch(e){}}
async function poll(){const start=performance.now();try{const c=new AbortController(),timer=setTimeout(()=>c.abort(),3000);const r=await fetch(TICKER,{cache:'no-store',signal:c.signal,headers:{accept:'application/json'}});clearTimeout(timer);if(!r.ok)throw Error('HTTP '+r.status);const x=(await r.json())?.data?.[0];if(!x||!x.last)throw Error('invalid');paint({p:+x.last,open:+x.open24h,high:+x.high24h,low:+x.low24h,vol:+x.vol24h},'OKX',Math.round(performance.now()-start))}catch(e){const el=$('#source'),dot=$('#dot');if(el)el.textContent='OKX 连接中';if(dot)dot.className='dot'}}
ensurePanels();cached();setTimeout(poll,60);setInterval(poll,5000);
})();
