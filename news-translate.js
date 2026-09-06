(()=>{const KEY='ethNewsZhV2';let cache={};try{cache=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}const dict={
'Ethereum ETF flows show renewed institutional demand as ETH volatility compresses':'以太坊 ETF 资金流显示机构需求重新升温，ETH 波动率持续收窄',
'Ethereum developers publish latest roadmap notes for scaling and validator UX':'以太坊开发者发布最新路线图，重点推进扩容与验证者用户体验',
'US macro data lifts crypto risk appetite; BTC leads broad market move':'美国宏观数据提振加密市场风险偏好，比特币领涨大盘行情',
'Regulators signal continued review of crypto market structure framework':'监管机构表示将继续审查加密市场结构监管框架',
'Large ETH transfer to centralized exchange triggers short-term supply alert':'大量 ETH 转入中心化交易所，触发短期供应压力预警',
'Layer-2 activity remains elevated as Ethereum gas demand stabilizes':'以太坊 Gas 需求趋稳，Layer-2 二层网络活跃度维持高位'
};
const looksEn=s=>{const x=s||'';return (x.match(/[A-Za-z]/g)||[]).length>10&&(x.match(/[\u4e00-\u9fff]/g)||[]).length<4};
async function translate(el){if(el.dataset.zh==='1'||!looksEn(el.textContent))return;const en=(el.dataset.en||el.textContent||'').trim();if(!en)return;
 if(dict[en]){el.textContent=dict[en];el.dataset.zh='1';cache[en]=dict[en];try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}return}
 if(cache[en]){el.textContent=cache[en];el.dataset.zh='1';return}
 try{const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q='+encodeURIComponent(en);const r=await fetch(u,{cache:'force-cache'});if(!r.ok)throw Error('translate');const d=await r.json();const zh=(d[0]||[]).map(x=>x[0]).join('').trim();if(zh){cache[en]=zh;try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}el.textContent=zh;el.dataset.zh='1';return}}
 catch(e){}
 try{const u='https://api.mymemory.translated.net/get?q='+encodeURIComponent(en)+'&langpair=en|zh-CN';const r=await fetch(u,{cache:'force-cache'});if(!r.ok)throw Error('fallback');const d=await r.json();const zh=(d.responseData&&d.responseData.translatedText||'').trim();if(zh&&zh!==en){cache[en]=zh;try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){}el.textContent=zh;el.dataset.zh='1'}}catch(e){}}
function scan(){document.querySelectorAll('#news .nt,#hot .nt').forEach((el,i)=>setTimeout(()=>translate(el),i*60))}
window.addEventListener('news-rendered',scan);window.addEventListener('load',()=>setTimeout(scan,250));new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();