(()=>{
'use strict';
const force=()=>{
  const source=document.querySelector('#source');
  if(source){source.textContent='OKX 实时';source.title='价格数据仅来自 OKX ETH-USDT';}
  const symbol=document.querySelector('.symbol');
  if(symbol)symbol.textContent='ETH / USDT · OKX 实时行情';
  const state=document.querySelector('#wsState');
  if(state && /BINANCE|GATE|MEXC|连接中|CONNECTING/i.test(state.textContent||'')){state.textContent='OKX LIVE';}
};
force();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',force,{once:true});
new MutationObserver(force).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
})();
