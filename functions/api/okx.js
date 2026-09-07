export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const instId = url.searchParams.get('instId') || 'ETH-USDT';
  if (!/^[A-Z0-9-]+$/.test(instId)) {
    return new Response(JSON.stringify({ code: '1', msg: 'invalid instId' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
  const upstream = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${encodeURIComponent(instId)}`, {
    headers: { 'accept': 'application/json' },
    cf: { cacheTtl: 0, cacheEverything: false }
  });
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
